<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'method',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'details'
    ];

    protected $casts = [
        'details' => 'array'
    ];
}
