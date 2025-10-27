<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRequest;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display the authenticated user's profile.
     */
    public function profile()
    {
        $user = Auth::user()->load([
            'addresses:id,user_id,label,city,country,is_default',
            'subscription:id,user_id,tier,is_active,end_date',
            'idverification:id,user_id,status',
        ]);

        return response()->json([
            'message' => 'Profile data fetched successfully',
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(UpdateUserRequest $request)
    {
        $user = Auth::user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
