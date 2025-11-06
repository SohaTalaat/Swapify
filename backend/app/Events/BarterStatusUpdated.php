<?php

namespace App\Events;

use App\Models\Barter;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BarterStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public Barter $barter;

    public function __construct(Barter $barter)
    {
        $this->barter = $barter;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.' . $this->barter->updated_by_user_id)];
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'barter_status',
            'message' => "Barter #{$this->barter->id} status changed to {$this->barter->status}",
            'barter_id' => $this->barter->id,
        ];
    }

    public function broadcastAs(): string
    {
        return 'barter.updated';
    }
}
