<?php

namespace App\Listeners;

use App\Events\NewMessageSent;
use App\Models\Notification;

class CreateMessageNotification
{
    public function handle(NewMessageSent $event)
    {
        $message = $event->message;
        $chat = $message->chat;

        if (!$chat || !$chat->participants) return;

        $receiver = $chat->participants()->where('users.id', '!=', $message->sender_id)->first();

        if ($receiver) {
            Notification::create([
                'user_id' => $receiver->id,
                'type' => 'message',
                'message' => 'You received a new message from user #' . $message->sender_id,
                'is_read' => false,
                'related_chat_id' => $chat->id,
                'related_user_id' => $message->sender_id,
            ]);

            broadcast(new \App\Events\UserNotificationCreated($receiver->id, [
                'type' => 'message',
                'message' => 'You received a new message from user #' . $message->sender_id,
                'chat_id' => $chat->id,
            ]));
        }
    }
}
