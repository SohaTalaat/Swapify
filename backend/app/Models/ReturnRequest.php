<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    protected $fillable = [
        'barter_id',
        'requester_id',
        'reason',
        'description',
        'status',
        'evidence_url',
        'responded_at',
        'completed_at'
    ];

    protected $casts = [
        'responded_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function barter()
    {
        return $this->belongsTo(Barter::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }
}
