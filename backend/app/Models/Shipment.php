<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $fillable = [
        'barter_id',
        'carrier_name',
        'tracking_number',
        'shipping_type',
        'status',
        'pickup_photo_url',
        'delivery_photo_url',
        'picked_up_at',
        'delivered_at'
    ];

    protected $casts = [
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function barter()
    {
        return $this->belongsTo(Barter::class);
    }
}
