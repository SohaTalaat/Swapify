<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Barter; // <--- هذا السطر مفقود
use Illuminate\Support\Facades\DB; // لو هتستخدم DB::

class Barter extends Model
{
protected $fillable = [
    'status',
    'chat_id',
    'exchange_type',
    'meeting_location',
    'meeting_time',
    'shipping_address_id',
    'agreed_at',
    'completed_at',
    'transaction_fee_amount',
    'shipping_address_text',
    'cancelled_at',
    'cancelled_by',
    'cancel_reason',
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
// public function chat()
// {
//     return $this->belongsTo(Chat::class);
// }
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
    public function cancelledByUser()
{
    return $this->belongsTo(User::class, 'cancelled_by');
}

}
