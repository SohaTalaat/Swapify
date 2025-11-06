<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class NewMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * channel name 
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->chat_id),
        ];
    }

    /**
     * data to frontend 
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->username ?? 'Unknown',
            'chat_id' => $this->message->chat_id,
            'created_at' => $this->message->created_at->toDateTimeString(),
        ];
    }

    /**
     * event to frontend
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
