<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListingImage extends Model
{
    protected $fillable = ['image_url', 'listing_id'];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
