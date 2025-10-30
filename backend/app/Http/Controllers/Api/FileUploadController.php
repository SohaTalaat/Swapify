<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IDVerification;
use App\Models\ListingImage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $uploadedFile = Cloudinary::upload($request->file('profile_picture')->getRealPath(), [
            'folder' => 'swapify/profiles',
            'transformation' => ['width' => 300, 'height' => 300, 'crop' => 'fill']
        ]);

        $user = $request->user();
        $user->profile_picture_url = $uploadedFile->getSecurePath();
        $user->save();

        return response()->json([
            'message' => 'Profile picture updated',
            'profile_picture_url' => $user->profile_picture_url
        ]);
    }

    public function uploadListingImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'listing_id' => 'required|exists:listings,id'
        ]);

        // Optional: Enforce max 5 images per listing (check existing count)
        $existingCount = ListingImage::where('listing_id', $request->listing_id)->count();
        if ($existingCount >= 5) {
            return response()->json(['error' => 'Maximum 5 images allowed per listing'], 400);
        }

        try {
            // Upload to Cloudinary
            $uploadedFile = Cloudinary::upload($request->file('image')->getRealPath(), [
                'folder' => 'swapify/listings',
                'public_id' => 'listing_' . $request->listing_id . '_' . Str::random(10),
                'overwrite' => false,
                'resource_type' => 'image'
            ]);

            // Save to DB
            $listingImage = ListingImage::create([
                'listing_id' => $request->listing_id,
                'image_url' => $uploadedFile->getSecurePath(), // HTTPS URL
                'display_order' => $existingCount + 1
            ]);

            return response()->json([
                'message' => 'Listing image uploaded successfully',
                'image' => $listingImage
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    // ID
    public function uploadIdVerification(Request $request)
    {
        $request->validate([
            'id_document' => 'required|file|mimes:jpeg,png,pdf|max:10240', // 10MB
            'selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120'      // 5MB
        ]);

        try {
            // Upload ID Document (private)
            $idUpload = Cloudinary::upload($request->file('id_document')->getRealPath(), [
                'folder' => 'swapify/ids/private',
                'public_id' => 'id_' . $request->user()->id . '_' . now()->timestamp,
                'resource_type' => 'auto', // auto-detect PDF/image
                'overwrite' => false
            ]);

            // Upload Selfie (private)
            $selfieUpload = Cloudinary::upload($request->file('selfie')->getRealPath(), [
                'folder' => 'swapify/ids/private',
                'public_id' => 'selfie_' . $request->user()->id . '_' . now()->timestamp,
                'resource_type' => 'image',
                'overwrite' => false
            ]);

            // Save to IDVerification model (create or update)
            $idVerification = IDVerification::updateOrCreate(
                ['user_id' => $request->user()->id],
                [
                    'id_document_url' => $idUpload->getSecurePath(),
                    'selfie_url' => $selfieUpload->getSecurePath(),
                    'status' => 'pending'
                ]
            );

            // Generate temporary signed URLs for admin review (expires in 1 hour)
            $idSignedUrl = Cloudinary::cloudinary()->uploadApi()->createDownloadToken(
                $idUpload->getPublicId(),
                ['expires_at' => now()->addHour()->timestamp]
            );
            $selfieSignedUrl = Cloudinary::cloudinary()->uploadApi()->createDownloadToken(
                $selfieUpload->getPublicId(),
                ['expires_at' => now()->addHour()->timestamp]
            );

            return response()->json([
                'message' => 'ID verification documents uploaded securely',
                'id_verification' => [
                    'id' => $idVerification->id,
                    'status' => 'pending',
                    // 🔒 Only send signed URLs to admins (not here!)
                    // For user: just confirm upload
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'ID upload failed: ' . $e->getMessage()], 500);
        }
    }
}
