<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'barter_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'communication_rating',
        'item_condition_rating',
        'timeliness_rating',
        'comment'
    ];

    public function barter()
    {
        return $this->belongsTo(Barter::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }
}
