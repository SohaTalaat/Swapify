<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'message',
        'is_read',
        'related_barter_id',
        'related_user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function relatedBarter()
    {
        return $this->belongsTo(Barter::class, 'related_barter_id');
    }

    public function relatedUser()
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }
}
