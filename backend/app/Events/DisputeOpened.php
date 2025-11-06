<?php

namespace App\Events;

use App\Models\Dispute;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DisputeOpened implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public Dispute $dispute;

    public function __construct(Dispute $dispute)
    {
        $this->dispute = $dispute;
    }

    public function broadcastOn(): array
    {
        // send to the other participant in the barter
        $receiverId = $this->dispute->barter->participants
            ->where('id', '!=', $this->dispute->initiator_id)
            ->first()->id ?? null;

        return [new PrivateChannel('user.' . $receiverId)];
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'dispute',
            'message' => 'A dispute was opened for barter #' . $this->dispute->barter_id,
            'barter_id' => $this->dispute->barter_id,
        ];
    }

    public function broadcastAs(): string
    {
        return 'dispute.opened';
    }
}
