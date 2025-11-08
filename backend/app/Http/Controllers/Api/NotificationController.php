<?php

namespace App\Http\Controllers\Api;

use App\Events\UserNotificationCreated;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get(['id', 'type', 'message', 'is_read', 'related_barter_id', 'related_user_id', 'created_at']);

        return response()->json([
            'count_unread' => $notifications->where('is_read', false)->count(),
            'notifications' => $notifications
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);

        if ($notification->is_read) {
            return response()->json(['message' => 'Notification already marked as read.']);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read successfully.']);
    }

    public function test()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'test',
            'message' => 'This is your first live notification ',
            'is_read' => false,
        ]);

        // manually trigger event for now
        event(new UserNotificationCreated($notification));

        return response()->json(['message' => 'Notification sent!', 'notification' => $notification]);
    }
}
