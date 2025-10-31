<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\IDVerification;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminIDVerificationController extends Controller
{
    public function show($id)
    {
        $idVerification = IDVerification::findOrfail($id);

        try {

            $cloudinary = new Cloudinary();

            $idSignedUrl = $cloudinary->image($idVerification->id_document_public_id)
                ->privateCdn(true)
                ->signUrl(true)
                ->deliveryType('private')
                ->toUrl();

            $selfieSignedUrl = $cloudinary->image($idVerification->selfie_public_id)
                ->privateCdn(true)
                ->signUrl(true)
                ->deliveryType('private')
                ->toUrl();

            return response()->json([
                'id_document_signed' => $idSignedUrl,
                'selfie_signed' => $selfieSignedUrl,
                'status' => $idVerification->status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not generate signed URLs: ' . $e->getMessage()
            ], 500);
        }
    }

    // Aprroval and Rejection
    public function approve($id)
    {
        $verification = IDVerification::findOrFail($id);
        $verification->update(['status' => 'approved', 'verified_by_admin_id' => Auth::id()]);
        $verification->user->update(['is_id_verified' => true]);
        // Optionally send notification to the user
        return response()->json(['message' => 'Verification approved']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['rejection_reason' => 'required|string|max:1000']);
        $verification = IDVerification::findOrFail($id);
        $verification->update(['status' => 'rejected', 'rejection_reason' => $request->rejection_reason]);
        // Optionally keep the files or delete them, depending on policy
        return response()->json(['message' => 'Verification rejected']);
    }
}
