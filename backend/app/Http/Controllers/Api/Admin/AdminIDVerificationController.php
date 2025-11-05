<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\IDVerification;
use App\Notifications\VerificationApproved;
use App\Notifications\VerificationRejected;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AdminIDVerificationController extends Controller
{

    public function index(Request $request)
    {
        $cacheKey = 'admin_id_verifications_' . md5(json_encode($request->query()));

        $verifications = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return IDVerification::with('user:id,full_name,email,is_id_verified')
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->latest()
                ->paginate($request->get('per_page', 10));
        });

        return response()->json($verifications);
    }
    public function show($id)
    {
        $idVerification = IDVerification::findOrFail($id);

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
                'status' => $idVerification->status,
                'user' => $idVerification->user()->select('id', 'full_name', 'email')->first(),
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
        $verification->update([
            'status' => 'approved',
            'verified_by_admin_id' => Auth::id(),
            'rejection_reason' => null,
        ]);

        $verification->user->update(['is_id_verified' => true]);
        $verification->user->notify(new VerificationApproved());

        return response()->json(['message' => 'Verification approved successfully']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['rejection_reason' => 'required|string|max:1000']);

        $verification = IDVerification::findOrFail($id);
        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'verified_by_admin_id' => Auth::id(),
        ]);
        $verification->user->notify(new VerificationRejected($request->rejection_reason));

        return response()->json(['message' => 'Verification rejected successfully']);
    }
}
