<?php

namespace App\Events;

use App\Models\Review;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewReviewCreated
{
    use Dispatchable, SerializesModels;

    public Review $review;

    public function __construct(Review $review)
    {
        $this->review = $review;
    }
}
