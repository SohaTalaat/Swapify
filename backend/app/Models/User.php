<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'phone',
        'location',
        'bio',
        'profile_picture_url',
        'is_verified',
        'average_rating',
        'total_reviews',
        'subscription_tier',
        'communication_preferences',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    //Relationships
    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function sendMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function bartersAsParticipant()
    {
        return $this->belongsToMany(Barter::class, 'barter_participants')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function idverification()
    {
        return $this->hasOne(IDVerification::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function getIsAdminAttribute()
    {
        return $this->role === 'admin';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_id_verified' => 'boolean',
            'communication_preferences' => 'array',
            'deleted_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }
}
