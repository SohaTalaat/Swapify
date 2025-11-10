<?php

namespace App\Listeners;

use App\Events\NewReviewCreated;
use App\Models\Notification;

class CreateReviewNotification
{
    public function handle(NewReviewCreated $event)
    {
        $review = $event->review;

        // Notify the user being reviewed
        Notification::create([
            'user_id' => $review->reviewed_user_id,
            'type' => 'review',
            'message' => 'You received a new review from ' . ($review->reviewer->username ?? 'someone'),
            'is_read' => false,
            'related_user_id' => $review->reviewer_id,
        ]);
    }
}
