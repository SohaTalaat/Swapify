<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IDVerification\StoreIDVerificationRequest;
use App\Models\IDVerification;
use Illuminate\Support\Facades\Auth;

class IDVerificationController extends Controller
{
    /**
     * Store or update user's ID verification request.
     */
    public function store(StoreIDVerificationRequest $request)
    {
        $user = Auth::user();

        // Check if user already has a verification request
        $existing = IDVerification::where('user_id', $user->id)->first();

        if ($existing && $existing->status === 'pending') {
            return response()->json([
                'message' => 'You already have a pending verification request.'
            ], 400);
        }

        // If exists and rejected, allow resubmission
        $verification = IDVerification::updateOrCreate(
            ['user_id' => $user->id],
            [
                'id_document_url' => $request->id_document_url,
                'selfie_url' => $request->selfie_url,
                'status' => 'pending',
                'rejection_reason' => null,
                'verified_by_admin_id' => null
            ]
        );

        // Reset user flag until approved
        $user->update(['is_id_verified' => false]);

        return response()->json([
            'message' => 'Verification request submitted successfully.',
            'verification' => $verification
        ], 201);
    }

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
