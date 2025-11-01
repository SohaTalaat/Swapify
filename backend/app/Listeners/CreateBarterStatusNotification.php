<?php

namespace App\Listeners;

use App\Events\BarterStatusUpdated;
use App\Models\Notification;

class CreateBarterStatusNotification
{
    public function handle(BarterStatusUpdated $event)
    {
        $barter = $event->barter;

        foreach ($barter->participants as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'barter_status',
                'message' => "Barter #{$barter->id} status changed to {$barter->status}",
                'is_read' => false,
                'related_barter_id' => $barter->id,
            ]);
        }
    }
}
