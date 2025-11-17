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

        if (Cache::has($cacheKey)) {
            return response()->json([
                'message' => 'Personalized recommendations (cached).',
                'recommendations' => Cache::get($cacheKey),
            ]);
        }

        // User AI vector from embeddings
        $userVector = $this->getUserProfileVector($user);

        // If user has no barters → fallback to latest listings
        if (! $userVector) {
            $fallbackListings = Listing::with(['category', 'images'])
                ->where('user_id', '!=', $user->id)
                ->where('is_active', true)
                ->where('approval_status', 'approved')
                ->latest()
                ->take(10)
                ->get();

            return response()->json([
                'message' => 'Not enough data → showing latest listings.',
                'recommendations' => $fallbackListings,
            ]);
        }

        // ================================
        // NEW: price preference detection
        // ================================
        $priceRange = $this->getUserPreferredPriceRange($user);
        $minPrice   = $priceRange['min'];
        $maxPrice   = $priceRange['max'];

        // Category preference
        $userPreferredCategoryId = $this->getUserPreferredCategoryId($user);

        // Fetch listings with embeddings
        $listings = ListingEmbedding::with(['listing.category', 'listing.images'])
            ->whereHas('listing', function ($q) use ($user, $minPrice, $maxPrice) {
                $q->where('user_id', '!=', $user->id)
                    ->where('is_active', true)
                    ->where('approval_status', 'approved')
                    ->whereBetween('price', [$minPrice, $maxPrice]);
            })
            ->get();

        // Ranking logic
        $results = $listings->map(function ($item) use ($userVector, $userPreferredCategoryId, $minPrice, $maxPrice) {

            $listing = $item->listing;

            // Base cosine similarity
            $similarity = $this->cosineSimilarity($userVector, $item->embedding);

            // Category boost
            if ($userPreferredCategoryId && $listing->category_id === $userPreferredCategoryId) {
                $similarity *= 1.1; // extra 10%
            }

            // Price boost
            $targetPrice    = ($minPrice + $maxPrice) / 2;
            $priceDistance  = abs($listing->price - $targetPrice);

            if ($priceDistance < ($targetPrice * 0.2)) { // within ±20%
                $similarity *= 1.15; // extra 15%
            }

            return [
                'listing'     => $listing,
                'similarity'  => $similarity,
            ];
        })
            ->sortByDesc('similarity')
            ->take(10)
            ->values();

        // Cache for 30 mins
        Cache::put($cacheKey, $results, 1800);

        return response()->json([
            'message' => 'Personalized hybrid AI recommendations.',
            'recommendations' => $results,
        ]);
    }

    // ======================================================
    // AI SIMILARITY + USER VECTOR HELPERS
    // ======================================================

    protected function cosineSimilarity(array $a, array $b): float
    {
        $dot = $sumA = $sumB = 0.0;
        $count = min(count($a), count($b));

        for ($i = 0; $i < $count; $i++) {
            $dot   += $a[$i] * $b[$i];
            $sumA  += $a[$i] ** 2;
            $sumB  += $b[$i] ** 2;
        }

        return $sumA && $sumB ? $dot / (sqrt($sumA) * sqrt($sumB)) : 0;
    }

    protected function getUserProfileVector($user): ?array
    {
        $embeddings = $user->barters()
            ->with('listings.listingEmbedding')
            ->get()
            ->pluck('listings')
            ->flatten()
            ->pluck('listingEmbedding.embedding')
            ->filter();

        if ($embeddings->isEmpty()) {
            return null;
        }

        $count = $embeddings->count();
        $dim   = count($embeddings->first());
        $sum   = array_fill(0, $dim, 0.0);

        foreach ($embeddings as $vec) {
            foreach ($vec as $i => $v) {
                $sum[$i] += $v;
            }
        }

        return array_map(fn($x) => $x / $count, $sum);
    }

    protected function getUserPreferredCategoryId($user): ?int
    {
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

    protected function getUserPreferredPriceRange($user): array
    {
        $prices = $user->barters()
            ->with('listings')
            ->get()
            ->pluck('listings')
            ->flatten()
            ->pluck('price')
            ->filter();

        if ($prices->isEmpty()) {
            return [
                'min' => 0,
                'max' => 999999,
            ];
        }

        $avg = $prices->avg();

        return [
            'min' => max(0, $avg * 0.6),  // -40%
            'max' => $avg * 1.4,         // +40%
        ];
    }
}
