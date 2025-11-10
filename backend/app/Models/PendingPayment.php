<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingPayment extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'merchant_order_id', 'amount', 'status'
    ];
}
