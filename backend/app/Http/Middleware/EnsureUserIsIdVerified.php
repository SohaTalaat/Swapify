<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // هذا السطر الصحيح
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsIdVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::user()?->is_id_verified) {
            return response()->json([
                'error' => 'يجب توثيق حسابك أولاً لإنشاء عرض.',
                'requires_verification' => true
            ], 403);
        }

        return $next($request);
    }
}