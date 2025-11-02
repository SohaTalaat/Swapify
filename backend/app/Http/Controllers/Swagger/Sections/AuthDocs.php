<?php

namespace App\Http\Controllers\Swagger\Sections;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class AuthDocs extends Controller
{
    /**
     * @OA\Tag(
     *     name="Authentication",
     *     description="Handles registration, login, logout, password reset and Google OAuth"
     * )
     */
    public function test1() {}
    /**
     * @OA\Post(
     *     path="/register",
     *     tags={"Authentication"},
     *     summary="Register a new user",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"full_name","email","password", "password_confirmation"},
     *             @OA\Property(property="full_name", type="string", example="Soha Talaat"),
     *             @OA\Property(property="email", type="string", example="soha@example.com"),
     *             @OA\Property(property="password", type="string", example="Password123"),
     *             @OA\Property(property="password_confirmation", type="string", example="Password123")
     *         )
     *     ),
     *     @OA\Response(response=201, description="User registered successfully"),
     *     @OA\Response(response=400, description="Validation failed")
     * )
     */
    public function test2() {}

    /**
     * @OA\Post(
     *     path="/login",
     *     tags={"Authentication"},
     *     summary="Login user and get Sanctum token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", example="soha@example.com"),
     *             @OA\Property(property="password", type="string", example="Password123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login successful"),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function test3() {}

    /**
     * @OA\Get(
     *     path="/auth/google/redirect",
     *     tags={"Authentication"},
     *     summary="Redirect to Google login page",
     *     @OA\Response(response=302, description="Redirects user to Google OAuth URL")
     * )
     *
     * @OA\Get(
     *     path="/auth/google/callback",
     *     tags={"Authentication"},
     *     summary="Handle Google OAuth callback and return user data with token",
     *     @OA\Response(response=200, description="Authenticated successfully with Google")
     * )
     */
    public function test4() {}
}
