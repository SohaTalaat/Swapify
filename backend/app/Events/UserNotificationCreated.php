<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

class UserNotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Notification $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        // every user has their own channel for notifications 
        return [
            new PrivateChannel('user.' . $this->notification->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'message' => $this->notification->message,
            'related_barter_id' => $this->notification->related_barter_id,
            'related_user_id' => $this->notification->related_user_id,
            'created_at' => $this->notification->created_at->toDateTimeString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }
}
