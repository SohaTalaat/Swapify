<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\StoreSubscriptionRequest;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Display the current user's subscription.
     */
    public function index()
    {
        $subscription = Auth::user()->subscription; // Use the relationship

        if (!$subscription) {
            return response()->json([
                'message' => 'No active subscription found',
                'tier' => 'free',
                'barter_limit' => 2, // Default free limit
                'barters_used' => 0
            ]);
        }

        return response()->json([
            'tier' => $subscription->tier,
            'start_date' => $subscription->start_date,
            'end_date' => $subscription->end_date,
            'is_active' => $subscription->is_active,
            'barter_limit' => $subscription->barter_limit,
            'barters_used' => $subscription->barters_used,
        ]);
    }

    /**
     * Store or renew a subscription for the user.
     */
    public function store(StoreSubscriptionRequest $request)
    {
        $data = $request->validated();

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

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
                'barter_limit' => $barterLimit, // ✅ Include limit
                'barters_used' => 0, // Reset on new subscription
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
