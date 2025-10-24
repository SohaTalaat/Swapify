<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    public function barter()
    {
        return $this->belongsTo(Barter::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
