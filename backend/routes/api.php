<?php

use App\Http\Controllers\Api\PaymobController;

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
    FileUploadController,
    ReturnRequestController,
    SubscriptionController,
    IDVerificationController,
    CompleteProfile,
    GoogleAuthController,
    Admin\AdminIDVerificationController,
    ReportController
};
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\AdminListingController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminShipmentController;
use App\Http\Controllers\Api\Admin\AdminUserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Normal auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');;
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Google Auth
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);


//Email verification
// Route::get('/email/verify', [AuthController::class, 'verifyEmail']);
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);


// Password Reset
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::get('/password/reset', [AuthController::class, 'showResetForm']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {

    // User routes
    Route::get('/user/profile', [UserController::class, 'profile']);

    Route::put('/user', [UserController::class, 'update']);

    // Categories routes

    Route::apiResource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

    //Listing routes
    Route::get('/listings/my', [ListingController::class, 'myOffers']);

    Route::apiResource('listings', ListingController::class);
    Route::get('/my-offers', [ListingController::class, 'myOffers']);  //abanoub
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
    //Barters routes

    Route::apiResource('barters', BarterController::class);
    Route::put('/barters/{id}/status', [BarterController::class, 'updateStatus']); //abanoub

    // Chats and Messages routes
    // Route::apiResource('chats', ChatController::class)->only(['index', 'show', 'store']);
    // Route::apiResource('chats.messages', MessageController::class)->shallow();
    // Route::post('barters/{barter}/messages', [MessageController::class, 'store'])
    //  ->name('barters.messages.store');

    // Notifications routes

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Reviews routes

    Route::apiResource('reviews', ReviewController::class)->only(['index', 'store']);

    // Disputes routes

    Route::apiResource('disputes', DisputeController::class)->only(['index', 'store', 'show']);

    // Return requests routes

    Route::apiResource('returns', ReturnRequestController::class)->only(['index', 'store', 'show']);


    // Subscriptions
    Route::apiResource('subscriptions', SubscriptionController::class)->only(['index', 'store']);
    Route::post('/id-verification', [IDVerificationController::class, 'store']);
    Route::middleware('auth:sanctum')->get('/id-verification', [IDVerificationController::class, 'index']);

    // Profile Completion
    Route::post('/profile/complete', [CompleteProfile::class, 'completeProfile']);
    Route::get('/profile/{email}', [CompleteProfile::class, 'getProfile']);

    // Files Upload
    Route::post('/upload/profile-picture', [FileUploadController::class, 'uploadProfilePicture']);
    Route::post('/upload/listing-image', [FileUploadController::class, 'uploadListingImage']);
    Route::post('/upload/id-verification', [FileUploadController::class, 'uploadIdVerification']);
    Route::get('/id-verification', [IDVerificationController::class, 'index']); // Status

    // Payment
    //     Route::post('/paymob/init', [PaymobController::class, 'initPayment']);
    // Route::match(['get', 'post'], '/paymob/callback', [PaymobController::class, 'callback']);
    //     Route::post('/paymob/webhook', [PaymobController::class, 'webhook']);

    //Report
    Route::post('/reports', [ReportController::class, 'store']);
});

// Admin Only Routes for uploaded files
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/id-verification', [AdminIDVerificationController::class, 'index']);
    Route::get('/id-verification/{id}', [AdminIDVerificationController::class, 'show']);
    Route::post('/id-verification/{id}/approve', [AdminIDVerificationController::class, 'approve']);
    Route::post('/id-verification/{id}/reject', [AdminIDVerificationController::class, 'reject']);

    //Overview page
    Route::get('/overview', [AdminController::class, 'overview']);

    //Manage Users
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{id}/ban', [AdminUserController::class, 'ban']);
    Route::patch('/users/{id}/activate', [AdminUserController::class, 'activate']);

    // Minitor Offers
    Route::get('/listings', [AdminListingController::class, 'index']);
    Route::patch('/listings/{id}/toggle', [AdminListingController::class, 'toggleStatus']);

    // Shipment
    Route::get('/shipments', [AdminShipmentController::class, 'index']);
    Route::patch('/shipments/{id}/status', [AdminShipmentController::class, 'updateStatus']);
    Route::post('/shipments/{id}/upload-photo', [AdminShipmentController::class, 'uploadPhoto']);

    // Content
    Route::get('/reports', [AdminReportController::class, 'index']);
    Route::middleware('auth:sanctum')->post('/reports', [ReportController::class, 'store']); //abanoub
    Route::get('/reports', [AdminReportController::class, 'index']); //abanoub
    Route::patch('/reports/{id}/remove', [AdminReportController::class, 'removeOffer']); //abanoub
    Route::patch('/reports/{id}/dismiss', [AdminReportController::class, 'dismiss']); //abanoub


});

// ======================
// 💳 Payment Routes (Public)
// ======================
Route::post('/paymob/init', [PaymobController::class, 'initPayment'])
    ->middleware('auth:sanctum'); // دي فقط محتاجة توثيق لأن المستخدم هو اللي بيبدأ الدفع

// Paymob بيرسل الرد هنا بعد الدفع (User Redirect)
Route::match(['get', 'post'], '/paymob/callback', [PaymobController::class, 'callback']);

// Paymob Webhook (Server to Server)
Route::post('/paymob/webhook', [PaymobController::class, 'webhook']);




// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chats', [ChatController::class, 'index']);
    Route::get('/chats/{chat}', [ChatController::class, 'show']);

    // رسائل البارتر
    Route::post('barters/{barter}/messages', [MessageController::class, 'store']);
    Route::get('barters/{barter}/messages', [MessageController::class, 'index']); // optional
});

// routes/api.php
Route::get('/chat/{chatId}/messages/latest', function ($chatId, Illuminate\Http\Request $request) {
    $lastMessageId = $request->query('last_message_id') ?? 0;

    $messages = \App\Models\Message::where('chat_id', $chatId)
        ->where('id', '>', $lastMessageId)
        ->with('sender:id,username')
        ->get();

    return response()->json($messages);
});
Route::get('/notifications/test', [NotificationController::class, 'test'])->middleware('auth:sanctum');
