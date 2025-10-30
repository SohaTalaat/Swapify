<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    // ───────────────────────────────
    // REGISTRATION + EMAIL VERIFICATION
    // ───────────────────────────────

    public function register(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'nullable|string|max:100',
        ]);

        // Generate Token
        $verification_token = Str::random(64);

        $user = User::create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'full_name' => $data['full_name'] ?? null,
            'verification_token' => $verification_token

        ]);

        // Send verification email
        Mail::send('emails.verify', [
            'url' => url("/api/email/verify?email={$user->email}&token={$verification_token}")
        ], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Verify your Swapify account');
        });

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'user' => $user->only('id', 'username', 'email', 'full_name'),
        ], 201);
    }

    //Verify email
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->where('verification_token', $request->token)
            ->first();

        if (!$user || $user->email_verified_at) {
            return redirect('http://localhost:4200/verification-failed?reason=invalid');
        }

        $user->email_verified_at = now();
        $user->save();

        return redirect("http://localhost:4200/complete-profile?email={$request->email}");
    }

    // ───────────────────────────────
    // LOGIN (with verification check)
    // ───────────────────────────────

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'error' => 'Please verify your email before logging in.',
                'requires_verification' => true
            ], 403);
        }

        $token = $user->createToken('swapify_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // ───────────────────────────────
    // PASSWORD RESET
    // ───────────────────────────────

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Str::random(64);
            $user->password_reset_token = $token;
            $user->password_reset_expires_at = now()->addHours(24);
            $user->save();

            Mail::send('emails.reset', [
            'url' => "http://localhost:4200/reset-password?email={$user->email}&token={$token}"
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Reset your Swapify password');
            });
        }

        // Always return success (to prevent email enumeration)
        return response()->json([
            'message' => 'If your email is registered, you will receive a password reset link.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)
            ->where('password_reset_token', $request->token)
            ->where('password_reset_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Invalid or expired reset token'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->password_reset_token = null;
        $user->password_reset_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Password reset successfully. You can now log in.']);
    }

    // ───────────────────────────────
    // LOGOUT
    // ───────────────────────────────

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
