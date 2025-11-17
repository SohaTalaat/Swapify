<?php

namespace App\Listeners;

// use App\Events\NewReviewCreated;
use App\Events\UserNotificationCreated;
use App\Models\Notification;

class CreateReviewNotification
{
    public function handle($event)
    {
        $review = $event->review;
        $reviewerId = $review->reviewer_id;
        $revieweeId = $review->reviewee_id;

        $notification = Notification::create([
            'user_id' => $revieweeId,
            'type' => 'new_review',
            'message' => "You received a {$review->rating}-star review",
            'is_read' => false,
            'related_user_id' => $reviewerId,
        ]);

        event(new UserNotificationCreated($notification));
    }
}
