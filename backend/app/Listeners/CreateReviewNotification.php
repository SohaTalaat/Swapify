<?php

namespace App\Listeners;

use App\Events\NewReviewCreated;
use App\Models\Notification;

class CreateReviewNotification
{
    public function handle(NewReviewCreated $event)
    {
        $review = $event->review;

        Notification::create([
            'user_id' => $review->reviewee_id,
            'type' => 'new_review',
            'message' => 'You received a new review from ' . ($review->reviewer->username ?? 'someone'),
            'is_read' => false,
            'related_barter_id' => $review->barter_id,
            'related_user_id' => $review->reviewer_id,
        ]);
    }
}
