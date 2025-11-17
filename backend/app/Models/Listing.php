<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'type',
        'condition',
        'availability_info',
        'desired_in_return',
        'is_active',
        'approval_status',
        'rejection_reason',
        'reviewed_by_admin_id',
        'reviewed_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ListingImage::class);
    }

    public function barters()
    {
        return $this->belongsToMany(Barter::class, 'barter_listings')
            ->withPivot('owner_user_id')
            ->withTimestamps();
    }

    public function listingEmbedding()
    {
        return $this->hasOne(ListingEmbedding::class, 'listing_id');
    }
}
