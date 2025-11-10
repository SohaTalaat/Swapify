<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingEmbedding;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function recommend(Request $request)
    {
        $user = $request->user();

        $userVector = $this->getUserProfileVector($user);

        if (! $userVector) {
            return response()->json(['message' => 'No enough data for recommendations'], 400);
        }

        $listings = ListingEmbedding::with('listing')->get();

        $results = $listings->map(function ($item) use ($userVector) {
            return [
                'listing' => $item->listing,
                'similarity' => $this->cosineSimilarity($userVector, $item->embedding),
            ];
        })->sortByDesc('similarity')->take(10)->values();

        return response()->json($results);
    }

    protected function cosineSimilarity(array $a, array $b): float
    {
        $dot = $sumA = $sumB = 0.0;
        $count = min(count($a), count($b));

        for ($i = 0; $i < $count; $i++) {
            $dot += $a[$i] * $b[$i];
            $sumA += $a[$i] ** 2;
            $sumB += $b[$i] ** 2;
        }

        return $sumA && $sumB ? $dot / (sqrt($sumA) * sqrt($sumB)) : 0;
    }

    protected function getUserProfileVector($user): ?array
    {
        $listings = $user->barters()
            ->with('listingEmbedding')
            ->get()
            ->pluck('listingEmbedding.embedding')
            ->filter();

        if ($listings->isEmpty()) {
            return null;
        }

        $count = count($listings);
        $dim = count($listings->first());
        $sum = array_fill(0, $dim, 0.0);

        foreach ($listings as $vec) {
            foreach ($vec as $i => $v) {
                $sum[$i] += $v;
            }
        }

        return array_map(fn($x) => $x / $count, $sum);
    }
}
