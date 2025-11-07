<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'tier',
        'start_date',
        'end_date',
        'payment_method',
        'is_active',
        'barter_limit',
        'barters_used'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'barter_limit' => 'integer',
        'barters_used' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
