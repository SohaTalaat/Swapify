<?php

namespace App\Events;

use App\Models\Barter;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BarterStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels, InteractsWithSockets;

    public Barter $barter;

    public function __construct(Barter $barter)
    {
        $this->barter = $barter->loadMissing('participants');
    }

    public function broadcastOn(): array
    {
        $userId = $this->barter->updated_by_user_id ?? $this->barter->participants->first()->id ?? null;

        if (!$userId) {
            Log::warning('BarterStatusUpdated: Missing updated_by_user_id for barter', ['barter_id' => $this->barter->id]);
            return [];
        }
        return [new PrivateChannel('user.' . $userId)];
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
