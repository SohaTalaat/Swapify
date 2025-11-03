<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description'
    ];
    public function listings()
    {
        return $this->hasMany(Listing::class);
    }
}
