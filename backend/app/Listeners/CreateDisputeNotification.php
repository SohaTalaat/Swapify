<?php

namespace App\Listeners;

use App\Events\DisputeOpened;
use App\Models\Notification;

class CreateDisputeNotification
{
    public function handle(DisputeOpened $event)
    {
        $dispute = $event->dispute;
        $barter = $dispute->barter;

        // Notify other participant
        foreach ($barter->participants as $user) {
            if ($user->id !== $dispute->initiator_id) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'dispute',
                    'message' => 'A dispute was opened for your barter #' . $barter->id,
                    'is_read' => false,
                    'related_barter_id' => $barter->id,
                    'related_user_id' => $dispute->initiator_id,
                ]);
            }
        }
    }
}
