<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisputeEvidence extends Model
{
    public function dispute()
    {
        return $this->belongsTo(Dispute::class);
    }

    public function user()
    {
        return $this->belongsTo(user::class);
    }
}
