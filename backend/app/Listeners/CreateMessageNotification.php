<?php

namespace App\Listeners;

// use App\Events\NewMessageSent;
use App\Events\UserNotificationCreated;
use App\Models\Notification;

class CreateMessageNotification
{
    public function handle($event)
    {
        $message = $event->message;
        $chat = $message->chat;
        $senderId = $message->sender_id;

        if (!$chat || !$chat->barter) return;

        // $receiver = $chat->participants()->where('users.id', '!=', $message->sender_id)->first();

        // Notify all participants EXCEPT sender
        foreach ($chat->barter->participants as $participant) {
            if ($participant->id === $senderId) continue;

            $notification = Notification::create([
                'user_id' => $participant->id,
                'type' => 'new_message',
                'message' => "New message in Barter #{$chat->barter->id}",
                'is_read' => false,
                'related_barter_id' => $chat->barter->id,
                'related_user_id' => $senderId,
            ]);

            event(new UserNotificationCreated($notification));
        }
    }
}
