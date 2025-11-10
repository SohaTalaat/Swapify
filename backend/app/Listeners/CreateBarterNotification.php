<?php

namespace App\Listeners;

use App\Events\UserNotificationCreated;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class CreateBarterNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle($event)
    {
        $barter = $event->barter;
        $creatorId = Auth::id();

        // Notify the receiver (not the creator)
        foreach ($barter->participants as $participant) {
            if ($participant->id === $creatorId) continue;

            $notification = Notification::create([
                'user_id' => $participant->id,
                'type' => 'new_barter_request',
                'message' => "New barter request for Barter #{$barter->id}",
                'is_read' => false,
                'related_barter_id' => $barter->id,
                'related_user_id' => $creatorId,
            ]);

            event(new UserNotificationCreated($notification));
        }
    }
}
