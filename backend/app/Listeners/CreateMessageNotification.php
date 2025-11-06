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

        // Identify the receiver (the user who didn't send the message)
        $receiver = $chat->participants
            ->where('id', '!=', $message->sender_id)
            ->first();

        if ($receiver) {
            // Save notification in DB
            Notification::create([
                'user_id' => $receiver->id,
                'type' => 'message',
                'message' => 'You received a new message from user #' . $message->sender_id,
                'is_read' => false,
                'related_chat_id' => $chat->id,
                'related_user_id' => $message->sender_id,
            ]);

            // Optional: send broadcast via a private channel for the receiver
            broadcast(new \App\Events\UserNotificationCreated($receiver->id, [
                'type' => 'message',
                'message' => 'You received a new message from user #' . $message->sender_id,
                'chat_id' => $chat->id,
            ]));
        }
    }
}
