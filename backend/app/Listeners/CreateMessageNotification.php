<?php

namespace App\Listeners;

use App\Events\NewMessageSent;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateMessageNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NewMessageSent $event)
    {
        $message = $event->message;

        // Find the receiver: the other participant in the barter chat
        $barter = $message->chat->barter;

        // participants is a collection of users attached to the barter pivot
        $receiverPivot = $barter->participants->firstWhere('user_id', '!=', $message->sender_id);

        // if there is no explicit receiver (edge cases), bail out
        if (! $receiverPivot) {
            return;
        }

        $receiverId = $receiverPivot->user_id;

        // Create a DB notification (uses your notifications table structure)
        Notification::create([
            'user_id' => $receiverId,
            'type' => 'new_message',
            'message' => 'You received a new message from ' . ($message->sender->username ?? 'someone'),
            'is_read' => false,
            'related_barter_id' => $message->chat->barter_id,
            'related_user_id' => $message->sender_id,
        ]);
    }
}
