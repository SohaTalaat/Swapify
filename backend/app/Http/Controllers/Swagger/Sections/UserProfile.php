<?php

namespace App\Http\Controllers\Swagger\Sections;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserProfile extends Controller
{
    /**
     * @OA\Tag(
     *     name="User Profile",
     *     description="Manage User profile Info and Update"
     * )
     */

    /**
     * @OA\Get(
     *     path="/api/user/profile",
     *     summary="Get authenticated user's profile",
     *     tags={"User"},
     *     security={{"sanctumAuth":{}}},
     *     @OA\Response(response=200, description="User profile data")
     * )
     *
     * @OA\Put(
     *     path="/api/user",
     *     summary="Update user profile",
     *     tags={"User"},
     *     security={{"sanctumAuth":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="full_name", type="string", example="Soha Talaat"),
     *             @OA\Property(property="bio", type="string", example="Enthusiastic developer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profile updated successfully")
     * )
     */
    public function test() {}
}
