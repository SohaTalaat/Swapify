<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    UserController,
    CategoryController,
    ListingController,
    BarterController,
    ChatController,
    MessageController,
    NotificationController,
    ReviewController,
    DisputeController,
    EmailVerificationController,
    ReturnRequestController,
    SubscriptionController,
    IDVerificationController,
    PasswordResetController
};

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->group(function () {

    // User routes
    Route::get('/user/profile', [UserController::class, 'profile']);

    Route::put('/user', [UserController::class, 'update']);

    // Categories routes

    Route::apiResource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

    //Listing routes

    Route::apiResource('listings', ListingController::class);
    //Barters routes

    Route::apiResource('barters', BarterController::class);
    // Chats and Messages routes
    Route::apiResource('chats', ChatController::class)->only(['index', 'show', 'store']);
    Route::apiResource('chats.messages', MessageController::class)->shallow();

    // Notifications routes

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Reviews routes

    Route::apiResource('reviews', ReviewController::class)->only(['index', 'store']);

    // Disputes routes

    Route::apiResource('disputes', DisputeController::class)->only(['index', 'store', 'show']);

    // Return requests routes

    Route::apiResource('returns', ReturnRequestController::class)->only(['index', 'store', 'show']);


    // Subscriptions and ID Verification routes
    Route::apiResource('subscriptions', SubscriptionController::class)->only(['index', 'store']);
    Route::post('/id-verification', [IDVerificationController::class, 'store']);
});
