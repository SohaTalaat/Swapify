<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingEmbedding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RecommendationController extends Controller
{
    public function recommend(Request $request)
    {
        $user = $request->user();

        // Cache key per user
        $cacheKey = "recommendations:{$user->id}";

        // Return cached recommendations if available
        if (Cache::has($cacheKey)) {
            return response()->json([
                'message' => 'Personalized recommendations (cached).',
                'recommendations' => Cache::get($cacheKey),
            ]);
        }

        $userVector = $this->getUserProfileVector($user);

        // If the user has no barters yet, show latest listings
        if (! $userVector) {
            $fallbackListings = Listing::with(['category', 'images'])
                ->where('user_id', '!=', $user->id)
                ->where('is_active', true)
                ->where('approval_status', 'approved') // Only approved listings
                ->latest()
                ->take(10)
                ->get();

            return response()->json([
                'message' => 'Not enough data to generate personalized recommendations. Showing latest listings instead.',
                'recommendations' => $fallbackListings->map(function ($listing) {
                    return [
                        'listing' => [
                            'id' => $listing->id,
                            'title' => $listing->title,
                            'description' => $listing->description,
                            'type' => $listing->type,
                            'condition' => $listing->condition,
                            'category' => $listing->category,
                            'images' => $listing->images->map(fn($img) => ['url' => $img->image_url])->toArray(),
                        ],
                        'similarity' => 0,
                    ];
                }),
            ]);
        }

        //  Determine user’s preferred category (for boosting)
        $userPreferredCategoryId = $this->getUserPreferredCategoryId($user);

        // Load all embeddings with listings
        $listings = ListingEmbedding::with(['listing.category', 'listing.images'])
            ->whereHas('listing', function ($q) use ($user) {
                $q->where('user_id', '!=', $user->id)
                    ->where('is_active', true)
                    ->where('approval_status', 'approved');
            })
            ->get();

        // Calculate similarities, apply category boost, and filter
        $results = $listings->map(function ($item) use ($userVector, $user, $userPreferredCategoryId) {
            $similarity = $this->cosineSimilarity($userVector, $item->embedding);

            // Boost listings from the same preferred category
            if ($userPreferredCategoryId && $item->listing->category_id === $userPreferredCategoryId) {
                $similarity *= 1.1; // small boost
            }

            return [
                'listing' => [
                    'id' => $item->listing->id,
                    'title' => $item->listing->title,
                    'description' => $item->listing->description,
                    'type' => $item->listing->type,
                    'condition' => $item->listing->condition,
                    'category' => $item->listing->category,
                    'images' => $item->listing->images->map(fn($img) => ['url' => $img->image_url])->toArray(),
                ],
                'similarity' => $similarity,
            ];
        })
            ->sortByDesc('similarity')
            ->take(10)
            ->values();

        //  Cache the results for 30 minutes
        Cache::put($cacheKey, $results, 1800);

        return response()->json([
            'message' => 'Personalized recommendations based on your activity.',
            'recommendations' => $results,
        ]);
    }

    // ------------------------- HELPER FUNCTIONS -------------------------

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
        // Get all embeddings from listings user has bartered with
        $listings = $user->barters()
            ->with('listings.listingEmbedding')
            ->get()
            ->pluck('listings')
            ->flatten()
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

    protected function getUserPreferredCategoryId($user): ?int
    {
        // Find the most frequent category from user’s previous listings
        $categoryCounts = $user->barters()
            ->with('listings')
            ->get()
            ->pluck('listings')
            ->flatten()
            ->pluck('category_id')
            ->filter()
            ->countBy();

        if ($categoryCounts->isEmpty()) {
            return null;
        }

        return (int) $categoryCounts->sortDesc()->keys()->first();
    }
}
