<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CompleteProfile extends Controller
{
    public function completeProfile(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string',
            'email' => 'required|email',
            'token' => 'required|string',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500',
            'profile_picture' => 'nullable|url', // or handle file upload separately
        ]);

        $user = User::where('email', $data['email'])
            ->first();
        $user->update($request->only('full_name', 'phone', 'location', 'bio'));
        $token = $user->createToken('swapify_token')->plainTextToken;



        if (!$user) {
            return response()->json(['error' => 'Invalid session'], 403);
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
