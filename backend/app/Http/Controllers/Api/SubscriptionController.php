<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Subscription;

class SubscriptionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $subscription = $user->subscription ?? (object)[
            'tier' => 'free',
            'is_active' => false,
            'barter_limit' => 2,
            'barters_used' => 0,
            'end_date' => null
        ];

        return response()->json($subscription);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tier' => 'required|in:free,basic,pro',
            'payment_method' => 'nullable|string'
        ]);

        $user = Auth::user();
        $tier = $request->tier;

        // الخطة المجانية
        if ($tier === 'free') {
            $this->activateFreePlan($user);
            return response()->json(['message' => 'تم تفعيل الخطة المجانية'], 201);
        }

        // الخطط المدفوعة → إعادة توجيه إلى Paymob
        $paymob = app(\App\Http\Controllers\Api\PaymobController::class);
        return $paymob->initPayment($request);
    }

    private function activateFreePlan($user)
    {
        Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'tier' => 'free',
                'start_date' => now(),
                'end_date' => now()->addMonth(),
                'payment_method' => 'manual',
                'is_active' => true,
                'barter_limit' => 2,
                'barters_used' => 0,
            ]
        );

        $user->update(['subscription_tier' => 'free']);
    }
}