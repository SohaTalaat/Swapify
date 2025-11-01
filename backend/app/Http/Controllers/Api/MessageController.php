<?php

namespace App\Http\Controllers\Api;

use App\Events\NewMessageSent;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Message\StoreMessageRequest;

class MessageController extends Controller
{
    /**
     * Display all messages within a specific chat.
     */
    public function index(Chat $chat)
    {
        // Ensure the user is part of the barter linked to this chat
        if (!$chat->barter->participants->contains(Auth::id())) {
            abort(403, 'Access denied');
        }

        return $chat->messages()
            ->with('sender:id,username,profile_picture_url')
            ->get();
    }

    /**
     * Send a new message in a chat.
     */
    public function store(StoreMessageRequest $request, Chat $chat)
    {
        if (!$chat->barter->participants->contains(Auth::id())) {
            abort(403, 'You are not part of this chat');
        }

        $message = $chat->messages()->create([
            'sender_id' => Auth::id(),
            'content' => $request->content,
            'is_read' => false,
        ]);

        // Fire event so listeners create notifications (and possibly other side effects)
        event(new NewMessageSent($message));

        return $message->load('sender:id,username,profile_picture_url');
    }
}
