<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    protected $fillable = [
        'barter_id',
        'initiator_id',
        'reason',
        'description',
        'status',
        'resolved_by_admin_id',
        'resolution_notes',
        'resolved_at'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function barter()
    {
        return $this->belongsTo(Barter::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function resolvedByAdmin()
    {
        return $this->belongsTo(user::class, 'resolved_by_admin_id');
    }

    public function evidence()
    {
        return $this->hasMany(DisputeEvidence::class);
    }
}
