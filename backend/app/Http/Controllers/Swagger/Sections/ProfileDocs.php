<?php

namespace App\Http\Controllers\Swagger\Sections;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileDocs extends Controller
{
    /**
     * @OA\Tag(
     *     name="User Profile",
     *     description="Manage user profile information and uploads"
     * )
     */
    public function test1() {}

    /**
     * @OA\Post(
     *     path="/profile/complete",
     *     tags={"User Profile"},
     *     summary="Complete user profile after registration",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"full_name","email"},
     *                 @OA\Property(property="full_name", type="string", example="Soha Talaat"),
     *                 @OA\Property(property="email", type="string", example="soha@example.com"),
     *                 @OA\Property(property="bio", type="string", example="I love bartering items."),
     *                 @OA\Property(property="location", type="string", example="Cairo, Egypt"),
     *                 @OA\Property(property="profile_picture", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profile completed successfully")
     * )
     */
    public function test2() {}

    /**
     * @OA\Post(
     *     path="/upload/profile-picture",
     *     tags={"User Profile"},
     *     summary="Upload profile picture to Cloudinary",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="profile_picture", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profile picture uploaded successfully")
     * )
     */
    public function test3() {}
}
