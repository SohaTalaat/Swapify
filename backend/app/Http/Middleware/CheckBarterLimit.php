<?php

namespace App\Http\Middleware;

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

        $subscription = Auth::user()->subscription;

        if (!$subscription) {
            return response()->json(['error' => 'No active subscription'], 403);
        }

        if ($subscription->barters_used >= $subscription->barter_limit) {
            return response()->json(['error' => 'Barter limit reached for this month'], 403);
        }

        return $next($request);
    }
}
