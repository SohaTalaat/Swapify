<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Broadcasting\PrivateChannel;

class UserBanned extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $reason;

    public function __construct(?string $reason = null)
    {
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Your account has been banned.',
            'reason' => $this->reason,
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function broadcastOn()
    {
        // the base Notification sets the notifiable before broadcasting
        $id = property_exists($this, 'notifiable') && isset($this->notifiable)
            ? $this->notifiable->id
            : null;

        if (!$id) {
            // fallback: will be resolved by framework in normal flow
            return new PrivateChannel('user.{id}');
        }

        return new PrivateChannel('user.' . $id);
    }
}
