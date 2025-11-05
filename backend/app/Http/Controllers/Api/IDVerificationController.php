<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IDVerification\StoreIDVerificationRequest;
use App\Models\IDVerification;
use Illuminate\Support\Facades\Auth;

class IDVerificationController extends Controller
{

    /**
     * Show the current user's verification status.
     */
    public function index()
    {
        $verification = IDVerification::where('user_id', Auth::id())->first();

        if (!$verification) {
            return response()->json([
                'message' => 'No verification request found.',
                'status' => 'not_submitted'
            ]);
        }

        return response()->json([
            'status' => $verification->status,
            'rejection_reason' => $verification->rejection_reason,
            'submitted_at' => $verification->created_at
        ]);
    }
}
