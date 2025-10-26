<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'full_name' => ['nullable', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'phone' => ['nullable', 'string', 'max:20'],
            'location' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string'],
            'profile_picture_url' => ['nullable', 'string'],
        ])->validate();

        return User::create([
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'full_name' => $input['full_name'] ?? null,
            'phone' => $input['phone'] ?? null,
            'location' => $input['location'] ?? null,
            'bio' => $input['bio'] ?? null,
            'profile_picture_url' => $input['profile_picture_url'] ?? null,
            'is_id_verified' => false,
            'average_rating' => 0.0,
            'total_reviews' => 0,
            'subscription_tier' => 'free',
            'role' => 'user',
        ]);

        // Generate API token in login
        $user->token = $user->createToken('swapify_token')->plainTextToken;

        return $user;
    }
}
