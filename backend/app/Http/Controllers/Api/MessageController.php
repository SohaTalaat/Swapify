<?php

namespace App\Http\Controllers\Api;

use App\Events\NewMessageSent;
use App\Http\Controllers\Controller;
use App\Models\Barter;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index(Chat $chat)
    {
        if (!$chat->barter->participants->contains(Auth::id())) {
            abort(403, 'Access denied');
        }

        return $chat->messages()->with('sender:id,username')->get();
    }

    public function store(Request $request, $barterId)
    {
        $barter = Barter::findOrFail($barterId);

        if (!$barter->participants->contains('id', Auth::id())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['content' => 'required|string|max:1000']);

        if (!$barter->chat) {
            $chat = Chat::create(['barter_id' => $barter->id]);
            $barter->chat()->save($chat);
            $barter->load('chat');
        }

        $message = $barter->chat->messages()->create([
            'sender_id' => Auth::id(),
            'content' => $request->content,
        ]);

        Log::info('About to broadcast MessageSent event for message ID: ' . $message->id);

        $message->load('sender');

        broadcast(new NewMessageSent($message))->toOthers();

        Log::info('Successfully broadcast MessageSent event for message ID: ' . $message->id);

        return response()->json(['message' => $message]);
    }
}
