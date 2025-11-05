<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barter;
use App\Models\IDVerification;
use App\Models\Listing;
use App\Models\User;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview()
    {
        return response()->json([
            'active_users' => User::where('role', 'user')->count(),
            'completed_barters' => Barter::where('status', 'completed')->count(),
            'active_items' => Listing::where('is_active', 'true')->count(),
        ]);
    }
}
