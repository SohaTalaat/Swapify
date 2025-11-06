<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\StoreSubscriptionRequest;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    /**
     * Display the current user's subscription.
     */
    public function index()
    {
        $subscription = Subscription::where('user_id', Auth::id())->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'No active subscription found',
                'tier' => 'free'
            ]);
        }

        return response()->json([
            'tier' => $subscription->tier,
            'start_date' => $subscription->start_date,
            'end_date' => $subscription->end_date,
            'is_active' => $subscription->is_active,
        ]);
    }

    /**
     * Store or renew a subscription for the user.
     */
    public function store(StoreSubscriptionRequest $request)
    {
        $data = $request->validated();

        // Determine barter limit based on plan
        $limits = [
            'free' => 2,
            'basic' => 5,
            'pro' => 10
        ];

        $tier = strtolower($data['tier']);
        $barterLimit = $limits[$tier] ?? 2;

        $subscription = Subscription::updateOrCreate(
            ['user_id' => Auth::id()],
            [
                'tier' => $tier,
                'start_date' => now(),
                'end_date' => now()->addMonth(),
                'payment_method' => $data['payment_method'] ?? 'manual',
                'barter_limit' => $barterLimit,
                'barters_used' => 0,
                'is_active' => true,
            ]
        );

        // Update user's tier
        Auth::user()->update(['subscription_tier' => $tier]);

        return response()->json([
            'message' => 'Subscription updated successfully',
            'subscription' => $subscription
        ]);
    }
}
