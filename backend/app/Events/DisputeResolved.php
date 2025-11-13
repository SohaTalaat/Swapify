<?php

namespace App\Events;

use App\Models\Dispute;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DisputeResolved implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public Dispute $dispute;

    public function __construct(Dispute $dispute)
    {
        $this->dispute = $dispute;
    }

    public function broadcastOn(): array
    {
        // Send to all admins on a dedicated admin channel
        return [new PrivateChannel('admin.disputes')];
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'dispute_resolved',
            'dispute_id' => $this->dispute->id,
            'status' => $this->dispute->status,
            'resolution_notes' => $this->dispute->resolution_notes,
            'resolved_by_admin_id' => $this->dispute->resolved_by_admin_id,
        ];
    }

    public function broadcastAs(): string
    {
        return 'dispute.resolved';
    }
}
