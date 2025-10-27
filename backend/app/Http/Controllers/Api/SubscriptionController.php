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

        $subscription = Subscription::updateOrCreate(
            ['user_id' => Auth::id()],
            [
                'tier' => $data['tier'],
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addMonth(),
                'payment_method' => $data['payment_method'] ?? 'manual',
                'is_active' => true,
            ]
        );

        // Update user’s tier in the users table as well
        $user = Auth::user();
        $user->update(['subscription_tier' => $subscription->tier]);

        return response()->json([
            'message' => 'Subscription updated successfully',
            'subscription' => $subscription
        ], 201);
    }
}
