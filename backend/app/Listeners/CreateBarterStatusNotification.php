<?php

namespace App\Listeners;

// use App\Events\BarterStatusUpdated;
use App\Events\UserNotificationCreated;
use App\Models\Notification;

class CreateBarterStatusNotification
{
    public function handle($event)
    {
        $barter = $event->barter;
        $updatedByUserId = $event->updatedByUserId;

        $statusMessages = [
            'proposed' => 'proposed a barter',
            'accepted' => 'accepted your barter',
            'completed' => 'completed the barter',
            'cancelled' => 'cancelled the barter',
            'disputed' => 'opened a dispute',
        ];

        $message = $statusMessages[$barter->status] ?? "updated Barter #{$barter->id}";

        foreach ($barter->participants as $user) {
            if ($user->id === $updatedByUserId) continue;

            $notification = Notification::create([
                'user_id' => $user->id,
                'type' => 'barter_status',
                'message' => "Barter #{$barter->id} status: $message",
                'is_read' => false,
                'related_barter_id' => $barter->id,
                'related_user_id' => $updatedByUserId,
            ]);

            event(new UserNotificationCreated($notification));
        }
    }
}
