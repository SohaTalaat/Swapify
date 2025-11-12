<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckBarterLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        //  Use the relationship defined in the User model
        $user = Auth::user();
        $subscription = $user->subscription;

        if (!$subscription) {
            return response()->json([
                'error' => 'No active subscription found',
                'message' => 'Please subscribe to a plan to start bartering',
                'redirect' => '/subscription'
            ], 403);
        }

        //  Check if subscription is expired
        if (!$subscription->is_active || Carbon::parse($subscription->end_date)->isPast()) {
            return response()->json([
                'error' => 'Subscription expired',
                'message' => 'Your subscription has expired. Please renew to continue.',
                'redirect' => '/subscription'
            ], 403);
        }

        // Check if user reached their barter limit
        if ($subscription->barters_used >= $subscription->barter_limit) {
            return response()->json([
                'error' => 'Barter limit reached',
                'message' => "You've reached your limit of {$subscription->barter_limit} barters for this month. Upgrade your plan to continue.",
                'current_plan' => $subscription->tier,
                'limit' => $subscription->barter_limit,
                'used' => $subscription->barters_used,
                'redirect' => '/subscription'
            ], 403);
        }

        return $next($request);
    }
}
