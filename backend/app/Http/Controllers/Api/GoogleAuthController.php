<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;


class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        /** @var \Laravel\Socialite\Contracts\Factory $socialite */
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrCreate([
                'email' => $googleUser->getEmail()
            ], [
                'username' => Str::slug($googleUser->getName()) . '_' . Str::random(5),
                'full_name' => $googleUser->getName(),
                'profile_picture_url' => $googleUser->getAvatar(),
                'password' => bcrypt(uniqid()), // Random Password
            ]);

            // Generate token
            $token = $user->createToken('swapify_token')->plainTextToken;

            // Return to Angular
            return redirect()->away('http://localhost:4200/login/callback?token=' . $token);
        } catch (\Exception $e) {
            return redirect()->away('http://localhost:4200/login/callback?error=' . urlencode($e->getMessage()));
        }
    }
}
