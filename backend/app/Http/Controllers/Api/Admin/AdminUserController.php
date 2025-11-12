<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Notifications\UserBanned;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller
{
    // List all users
    public function index()
    {
        $users = User::select('id', 'full_name', 'email', 'status', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($users);
    }

    // Ban user
    public function ban(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['error' => 'You cannot ban another admin.'], 403);
        }

        $reason = $request->input('reason');

        $user->update([
            'status' => 'banned',
            'ban_reason' => $reason,
        ]);

        // Send notification (broadcast + database)
        try {
            $user->notify(new UserBanned($reason));
        } catch (\Exception $e) {
            // don't fail the operation if notification fails
            Log::error('Failed to notify user about ban: ' . $e->getMessage());
        }

        return response()->json(['message' => "{$user->full_name} has been banned."]);
    }

    // Activate user
    public function activate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active', 'ban_reason' => null]);

        return response()->json(['message' => "{$user->full_name} has been reactivated."]);
    }
}
