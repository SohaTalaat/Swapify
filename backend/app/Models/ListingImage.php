<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListingImage extends Model
{
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
