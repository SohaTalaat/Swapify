<?php
use App\Http\Controllers\Api\AuthController;

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-cloud', function () {
    return env('CLOUDINARY_URL');
    
});


Route::get('/email/verify', [AuthController::class, 'verifyEmail']);
