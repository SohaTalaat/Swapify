<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListingEmbedding extends Model
{
    protected $fillable = ['listing_id', 'embedding', 'provider'];

    protected $casts = [
        'embedding' => 'array',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}
