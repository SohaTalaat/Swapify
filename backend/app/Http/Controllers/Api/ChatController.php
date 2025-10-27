<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Barter;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Chat\StoreChatRequest;

class ChatController extends Controller
{
    /**
     * Display all chats that belong to the authenticated user.
     */
    public function index()
    {
        return Chat::whereHas('barter.participants', function ($q) {
            $q->where('user_id', Auth::id());
        })
            ->with([
                'barter:id,status',
                'barter.listings:id,title',
                'messages' => fn($q) => $q->latest()->take(1)
            ])
            ->latest()
            ->get();
    }

    /**
     * Create a new chat for a barter.
     */
    public function store(StoreChatRequest $request)
    {
        $barter = Barter::findOrFail($request->barter_id);

        // Ensure the user is part of the barter
        if (!$barter->participants->contains(Auth::id())) {
            abort(403, 'You are not part of this barter');
        }

        $chat = Chat::create(['barter_id' => $barter->id]);

        return $chat->load('barter');
    }

    /**
     * Show chat details including all messages.
     */
    public function show(Chat $chat)
    {
        // Ensure the user is part of the barter related to this chat
        if (!$chat->barter->participants->contains(Auth::id())) {
            abort(403, 'Access denied');
        }

        return $chat->load([
            'barter:id,status',
            'messages.sender:id,username,profile_picture_url'
        ]);
    }
}
