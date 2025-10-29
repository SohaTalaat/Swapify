<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompleteProfile extends Controller
{
    public function completeProfile(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'full_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // ✅ لو الصورة موجودة نرفعها
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profiles', 'public');
            $data['profile_picture_url'] = asset('storage/' . $path);
        }

        // نحذف المفتاح القديم لو مش متبعت
        unset($data['profile_picture']);

        $user->update($data);

        $token = $user->createToken('swapify_token')->plainTextToken;

        return response()->json([
            'message' => 'Profile completed successfully',
            'user' => $user,
            'token' => $token,
        ]);
    }
    public function getProfile($email)
{
    $user = User::where('email', $email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    return response()->json($user);
}

}
