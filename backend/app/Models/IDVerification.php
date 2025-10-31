<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IDVerification extends Model
{
        protected $table = 'id_verifications'; // 👈 أضف هذا السطر

    protected $fillable = [
        'user_id',
        'id_document_url',
        'selfie_url',
        'id_document_public_id',
        'selfie_public_id',
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
