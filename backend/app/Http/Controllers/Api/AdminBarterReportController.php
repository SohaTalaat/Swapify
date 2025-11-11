<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barter; // <--- هذا السطر مهم
use Illuminate\Support\Facades\DB;

class AdminBarterReportController extends Controller
{
    public function index()
    {
        $stats = [
            'total' => Barter::count(),
            'cancelled' => Barter::where('status', 'cancelled')->count(),
            'active' => Barter::where('status', '!=', 'cancelled')->count(),
        ];

        $reasons = Barter::whereNotNull('cancel_reason')
            ->select('cancel_reason', DB::raw('COUNT(*) as count'))
            ->groupBy('cancel_reason')
            ->get();

        return response()->json([
            'stats' => $stats,
            'reasons' => $reasons,
        ]);
    }
    // In AdminBarterReportController.php
public function cancelledBarters()
{
    $barters = Barter::with(['cancelledByUser:id,username'])
        ->where('status', 'cancelled')
        ->latest()
        ->get();

    return response()->json(
        $barters->map(fn($b) => [
            'id' => $b->id,
            'cancelled_at' => $b->cancelled_at,
            'cancel_reason' => $b->cancel_reason,
            'cancelled_by_id' => $b->cancelled_by,
            'cancelled_by_username' => $b->cancelledByUser?->username,
        ])
    );
}
}
