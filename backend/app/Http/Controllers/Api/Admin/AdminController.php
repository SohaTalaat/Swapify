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
use Carbon\Carbon;
class AdminController extends Controller
{
//     public function overview()
// {
//     $subscriptions = Subscription::selectRaw('tier, COUNT(*) as count')
//         ->groupBy('tier')
//         ->pluck('count', 'tier');

//     // حساب إجمالي الأرباح (افترض أن Basic = 10$ و Pro = 20$ شهريًا)
//     $totalRevenue = (
//         ($subscriptions['basic'] ?? 0) * 10 +   // كل مشترك Basic يدفع 10
//         ($subscriptions['pro'] ?? 0) * 20      // كل مشترك Pro يدفع 20
//     );

//     return response()->json([
//         'active_users' => User::where('role', 'user')->count(),
//         'completed_barters' => Barter::where('status', 'completed')->count(),
//         'active_items' => Listing::where('is_active', 1)->count(),

//         // Subscription Stats
//         'subscriptions' => [
//             'free'  => $subscriptions['free'] ?? 0,
//             'basic' => $subscriptions['basic'] ?? 0,
//             'pro'   => $subscriptions['pro'] ?? 0,
//         ],

//         // إضافة إجمالي الأرباح
//         'total_revenue' => $totalRevenue,
//         'revenue_currency' => 'USD', // أو 'EGP' حسب عملتك
//     ]);
// }

public function overview()
{
    $subscriptions = Subscription::selectRaw('tier, COUNT(*) as count')
        ->groupBy('tier')
        ->pluck('count', 'tier');

    $totalRevenue = ($subscriptions['basic'] ?? 0) * 10 + ($subscriptions['pro'] ?? 0) * 20;

    // === إيرادات آخر 12 شهر ===
    $monthlyRevenue = [];
    $now = Carbon::now();

    for ($i = 11; $i >= 0; $i--) {
        $month = $now->copy()->subMonths($i);
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        $basicCount = Subscription::where('tier', 'basic')
            ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
            ->orWhere(function ($q) use ($startOfMonth, $endOfMonth) {
                $q->where('tier', 'basic')
                  ->where('start_date', '<=', $endOfMonth)
                  ->where('end_date', '>=', $startOfMonth);
            })
            ->where('is_active', true)
            ->count();

        $proCount = Subscription::where('tier', 'pro')
            ->whereBetween('start_date', [$startOfMonth, $endOfMonth])
            ->orWhere(function ($q) use ($startOfMonth, $endOfMonth) {
                $q->where('tier', 'pro')
                  ->where('start_date', '<=', $endOfMonth)
                  ->where('end_date', '>=', $startOfMonth);
            })
            ->where('is_active', true)
            ->count();

        $revenue = $basicCount * 10 + $proCount * 20;

        $monthlyRevenue[] = [
            'month' => $month->translatedFormat('F Y'), // يناير 2025، فبراير 2025...
            'short_month' => $month->translatedFormat('M'), // يناير → "ينا"
            'year' => $month->year,
            'revenue' => $revenue,
            'formatted' => number_format($revenue) . ' ج.م'
        ];
    }

    return response()->json([
        'active_users' => User::where('role', 'user')->count(),
        'completed_barters' => Barter::where('status', 'completed')->count(),
        'active_items' => Listing::where('is_active', 1)->count(),

        'subscriptions' => [
            'free'  => $subscriptions['free'] ?? 0,
            'basic' => $subscriptions['basic'] ?? 0,
            'pro'   => $subscriptions['pro'] ?? 0,
        ],

        'total_revenue' => $totalRevenue,
        'revenue_currency' => 'EGP',

        // الجديد: الإيرادات الشهرية
        'monthly_revenue' => $monthlyRevenue,
    ]);
}
}