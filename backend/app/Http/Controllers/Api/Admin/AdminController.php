<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barter;
use App\Models\IDVerification;
use App\Models\Listing;
use App\Models\User;
use App\Models\Subscription;          // ADD THIS LINE
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview()
    {
        $subscriptions = Subscription::selectRaw('tier, COUNT(*) as count')
            ->groupBy('tier')
            ->pluck('count', 'tier');

        return response()->json([
            'active_users' => User::where('role', 'user')->count(),
            'completed_barters' => Barter::where('status', 'completed')->count(),
            'active_items' => Listing::where('is_active', 1)->count(),

            // Subscription Stats
            'subscriptions' => [
                'free'  => $subscriptions['free'] ?? 0,
                'basic' => $subscriptions['basic'] ?? 0,
                'pro'   => $subscriptions['pro'] ?? 0,
            ],
        ]);
    }
}