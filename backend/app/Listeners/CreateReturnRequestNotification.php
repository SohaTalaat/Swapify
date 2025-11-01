<?php

namespace App\Listeners;

use App\Events\ReturnRequestCreated;
use App\Models\Notification;

class CreateReturnRequestNotification
{
    public function handle(ReturnRequestCreated $event)
    {
        $req = $event->returnRequest;

        // Notify the other participant in barter
        $barter = $req->barter;
        $receiver = $barter->participants->where('id', '!=', $req->requester_id)->first();

        if ($receiver) {
            Notification::create([
                'user_id' => $receiver->id,
                'type' => 'return_request',
                'message' => 'A return request was created for Barter #' . $barter->id,
                'is_read' => false,
                'related_barter_id' => $barter->id,
                'related_user_id' => $req->requester_id,
            ]);
        }
    }
}
