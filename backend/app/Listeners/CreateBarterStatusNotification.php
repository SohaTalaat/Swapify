<?php

namespace App\Listeners;

// use App\Events\BarterStatusUpdated;
use App\Events\UserNotificationCreated;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateBarterStatusNotification implements ShouldQueue
{
    public function handle($event)
    {
        $barter = $event->barter;
        $updatedByUserId = $event->updatedByUserId ?? null;

        if (!$barter || !$barter->participants || $barter->participants->isEmpty()) {
            Log::warning('CreateBarterStatusNotification: Barter or participants missing', [
                'barter_id' => $barter->id ?? null,
                'updated_by' => $updatedByUserId,
            ]);
            return;
        }

        $statusMessages = [
            'proposed' => 'proposed a barter',
            'accepted' => 'accepted your barter',
            'completed' => 'completed the barter',
            'cancelled' => 'cancelled the barter',
            'disputed' => 'opened a dispute',
        ];

        $message = $statusMessages[$barter->status] ?? "updated Barter #{$barter->id}";

        foreach ($barter->participants as $user) {
            if ($updatedByUserId && $user->id === $updatedByUserId) continue;

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
