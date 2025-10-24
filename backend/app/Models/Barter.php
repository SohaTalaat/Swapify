<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barter extends Model
{
    protected $fillable = [
        'status',
        'exchange_type',
        'meeting_location',
        'meeting_time',
        'shipping_address_id',
        'agreed_at',
        'completed_at',
        'transaction_fee_amount'
    ];

    protected $casts = [
        'agreed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function participants()
    {
        return $this->belongsToMany(User::class, 'barter_participants')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function listings()
    {
        return $this->belongsToMany(Listing::class, 'barter_listings')
            ->withPivot('owner_user_id')
            ->withTimestamps();
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function chat()
    {
        return $this->hasOne(Chat::class);
    }

    public function shippments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class);
    }

    public function returnRequest()
    {
        return $this->hasOne(ReturnRequest::class);
    }
}
