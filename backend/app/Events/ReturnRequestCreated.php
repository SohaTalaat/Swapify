<?php

namespace App\Events;

use App\Models\ReturnRequest;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnRequestCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public ReturnRequest $returnRequest;

    public function __construct(ReturnRequest $returnRequest)
    {
        $this->returnRequest = $returnRequest;
    }

    public function broadcastOn(): array
    {
        $receiverId = $this->returnRequest->barter->participants
            ->where('id', '!=', $this->returnRequest->requester_id)
            ->first()->id ?? null;

        return [new PrivateChannel('user.' . $receiverId)];
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'return_request',
            'message' => 'A return request was created for barter #' . $this->returnRequest->barter_id,
        ];
    }

    public function broadcastAs(): string
    {
        return 'return.created';
    }
}
