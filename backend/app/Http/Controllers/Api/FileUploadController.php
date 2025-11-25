<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IDVerification;
use App\Models\ListingImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Cloudinary\Api\Upload\UploadApi;

class FileUploadController extends Controller
{
    /**
     * Upload user profile picture
     */
    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated user'], 401);
        }

        try {
            // Upload to Cloudinary using official SDK
            $upload = (new UploadApi())->upload(
                $request->file('profile_picture')->getRealPath(),
                [
                    'folder' => 'swapify/profiles',
                    'transformation' => [
                        'width' => 300,
                        'height' => 300,
                        'crop' => 'fill',
                    ],
                ]
            );

            $user->profile_picture_url = $upload['secure_url'];
            $user->save();

            return response()->json([
                'message' => 'Profile picture uploaded successfully',
                'profile_picture_url' => $user->profile_picture_url,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload listing image
     */
    public function uploadListingImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'listing_id' => 'required|exists:listings,id',
        ]);

        $existingCount = ListingImage::where('listing_id', $request->listing_id)->count();
        if ($existingCount >= 5) {
            return response()->json(['error' => 'Maximum 5 images allowed per listing'], 400);
        }

        try {
            // Upload to Cloudinary
            $upload = (new UploadApi())->upload(
                $request->file('image')->getRealPath(),
                [
                    'folder' => 'swapify/listings',
                    'public_id' => 'listing_' . $request->listing_id . '_' . Str::random(10),
                    'overwrite' => false,
                    'resource_type' => 'image',
                ]
            );

            $listingImage = ListingImage::create([
                'listing_id' => $request->listing_id,
                'image_url' => $upload['secure_url'],
                'display_order' => $existingCount + 1,
            ]);

            return response()->json([
                'message' => 'Listing image uploaded successfully',
                'image' => $listingImage,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload ID verification (ID + selfie)
     */
    public function uploadIdVerification(Request $request)
    {
        $request->validate([
            'id_document' => 'required|file|mimes:jpeg,png,pdf|max:10240',
            'selfie' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        try {
            $user = $request->user();
            $userId = $user->id ?? 'guest_' . Str::random(6);
            $uploadApi = new UploadApi();

            // Upload ID document
            $idUpload = $uploadApi->upload(
                $request->file('id_document')->getRealPath(),
                [
                    'folder' => 'swapify/ids/private',
                    'type' => 'private',
                    'public_id' => 'id_' . $userId . '_' . now()->timestamp,
                    'resource_type' => 'auto',
                    'overwrite' => false,
                ]
            );

            // Upload selfie
            $selfieUpload = $uploadApi->upload(
                $request->file('selfie')->getRealPath(),
                [
                    'folder' => 'swapify/ids/private',
                    'type' => 'private',
                    'public_id' => 'selfie_' . $userId . '_' . now()->timestamp,
                    'resource_type' => 'image',
                    'overwrite' => false,
                ]
            );

            // Save in DB
            $idVerification = IDVerification::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'id_document_url' => $idUpload['secure_url'] ?? null,
                    'selfie_url' => $selfieUpload['secure_url'] ?? null,
                    'id_document_public_id' => $idUpload['public_id'] ?? null,
                    'selfie_public_id' => $selfieUpload['public_id'] ?? null,
                    'status' => 'pending',
                ]
            );

            return response()->json([
                'message' => 'ID verification documents uploaded successfully',
                'id_verification' => $idVerification,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'ID upload failed: ' . $e->getMessage()], 500);
        }
    }
}
