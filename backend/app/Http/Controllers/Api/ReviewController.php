<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Models\Review;
use App\Models\Barter;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display all reviews received by the authenticated user.
     */
    public function index()
    {
        $userId = Auth::id();

        return response()->json([
            'received' => Review::where('reviewee_id', $userId)
                ->with(['reviewer:id,username,profile_picture_url', 'barter:id,status'])
                ->latest()->get(),
            'given' => Review::where('reviewer_id', $userId)
                ->with(['reviewee:id,username,profile_picture_url', 'barter:id,status'])
                ->latest()->get(),
        ]);
    }


    /**
     * Store a new review for a completed barter.
     */
    public function store(StoreReviewRequest $request)
    {
        $data = $request->validated();
        $barter = Barter::findOrFail($data['barter_id']);

        // Ensure the user participated in this barter
        if (!$barter->participants->contains(Auth::id())) {
            abort(403, 'You are not part of this barter');
        }

        // Prevent user from reviewing the same barter twice
        $existingReview = Review::where('barter_id', $barter->id)
            ->where('reviewer_id', Auth::id())
            ->exists();

        if ($existingReview) {
            abort(400, 'You already reviewed this barter');
        }

        $review = Review::create([
            'barter_id' => $barter->id,
            'reviewer_id' => Auth::id(),
            'reviewee_id' => $data['reviewee_id'],
            'rating' => $data['rating'],
            'communication_rating' => $data['communication_rating'] ?? null,
            'item_condition_rating' => $data['item_condition_rating'] ?? null,
            'timeliness_rating' => $data['timeliness_rating'] ?? null,
            'comment' => $data['comment'] ?? null,
        ]);

        // Update average rating for the reviewed user
        $this->updateUserAverageRating($data['reviewee_id']);

        return $review->load('reviewer:id,username,profile_picture_url');
    }

    /**
     * Update user's average rating after each review.
     */
    protected function updateUserAverageRating($userId)
    {
        $reviews = Review::where('reviewee_id', $userId);
        $average = $reviews->avg('rating');
        $count = $reviews->count();

        $user = \App\Models\User::find($userId);
        $user->update([
            'average_rating' => $average,
            'total_reviews' => $count,
        ]);
    }
}
