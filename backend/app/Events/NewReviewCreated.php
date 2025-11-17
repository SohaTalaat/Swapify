<?php

namespace App\Events;

use App\Models\Review;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewReviewCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels, InteractsWithSockets;

    public Review $review;

    public function __construct(Review $review)
    {
        $this->review = $review;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.' . $this->review->reviewed_user_id)];
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'review',
            'message' => 'You received a new review from ' . ($this->review->reviewer->username ?? 'a user'),
            'rating' => $this->review->rating,
        ];
    }

    public function broadcastAs(): string
    {
        return 'review.created';
    }
}
