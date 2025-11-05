<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IDVerification\StoreIDVerificationRequest;
use App\Models\IDVerification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
class IDVerificationController extends Controller
{
    /**
     * Store or update user's ID verification request.
     */
public function store(Request $request)
{
    $request->validate([
        'id_document' => 'required|image|max:5120', // 5MB
        'selfie' => 'required|image|max:5120',
    ]);

    $cloudinary = new Cloudinary([
        'cloud' => [
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key'    => env('CLOUDINARY_API_KEY'),
            'api_secret' => env('CLOUDINARY_API_SECRET'),
        ],
        'url' => [
            'secure' => true
        ]
    ]);

    // رفع صورة الهوية
    $idUpload = (new UploadApi())->upload($request->file('id_document')->getRealPath(), [
        'folder' => 'swapify/id_verifications'
    ]);

    // رفع السيلفي
    $selfieUpload = (new UploadApi())->upload($request->file('selfie')->getRealPath(), [
        'folder' => 'swapify/id_verifications'
    ]);

    // حفظ الروابط في قاعدة البيانات
    $verification = IDVerification::updateOrCreate(
        ['user_id' => auth()->id()],
        [
            'id_document_url' => $idUpload['secure_url'],
            'selfie_url' => $selfieUpload['secure_url'],
            'status' => 'pending',
            'rejection_reason' => null,
            'verified_by_admin_id' => null
        ]
    );

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
            'message' => 'لا يوجد طلب تحقق',
            'status' => 'not_submitted'
        ]);
    }

    return response()->json([
        'status' => $verification->status,
        'rejection_reason' => $verification->rejection_reason,
        'submitted_at' => $verification->created_at,
        'id_document_url' => $verification->id_document_url,
        'selfie_url' => $verification->selfie_url,
    ]);
}

}
