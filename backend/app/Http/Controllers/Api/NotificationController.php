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
        // Support pagination via ?page= and ?per_page=
        $perPage = request()->query('per_page', 10);

        $query = Notification::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->select(['id', 'type', 'message', 'is_read', 'related_barter_id', 'related_user_id', 'created_at']);

        $paginated = $query->paginate((int) $perPage);

        return response()->json([
            'count_unread' => Notification::where('user_id', Auth::id())->where('is_read', false)->count(),
            'notifications' => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
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
        $user = Auth::user();

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
