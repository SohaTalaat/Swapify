<?php

namespace App\Listeners;

use App\Events\UserNotificationCreated;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateVerificationNotification
{
    public function handle($event)
    {
        $verification = $event->verification;
        $userId = $verification->user_id;
        $status = $verification->status;

        $messages = [
            'verified' => '✅ Your ID verification was approved!',
            'rejected' => '❌ Your ID verification was rejected.',
        ];

        if (!isset($messages[$status])) return;

        $notification = Notification::create([
            'user_id' => $userId,
            'type' => 'verification_' . $status,
            'message' => $messages[$status],
            'is_read' => false,
        ]);

        event(new UserNotificationCreated($notification));
    }
}
