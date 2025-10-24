<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bartersAsShpping()
    {
        return $this->hasMany(Barter::class, 'shipping_address_id');
    }
}
