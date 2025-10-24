<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IDVerification extends Model
{
    protected $fillable = [
        'user_id',
        'id_document_url',
        'selfie_url',
        'status',
        'rejection_reason',
        'verified_by_admin_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedByAdmin()
    {
        return $this->belongsTo(User::class, 'verified_by_admin_id');
    }
}
