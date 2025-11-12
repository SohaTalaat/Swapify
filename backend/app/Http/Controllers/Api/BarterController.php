<?php

namespace App\Http\Controllers\Api;

use App\Events\BarterCreated;
use App\Events\BarterStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Barter;
use App\Models\Listing;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Barter\StoreBarterRequest;
use App\Http\Requests\Barter\UpdateBarterRequest;
use App\Models\Shipment;
use Illuminate\Http\Request;

class BarterController extends Controller
{
    public function index()
    {
        return Auth::user()
            ->bartersAsParticipant()
            ->with([
                'participants:id,username',
                'listings' => function ($query) {
                    $query->select('listings.id', 'listings.title')
                        ->withPivot('owner_user_id')
                        ->with('images:id,listing_id,image_url');
                },
            ])
            ->latest()
            ->get();
    }

    public function store(StoreBarterRequest $request)
    {
        $user = Auth::user();

        if ($user->status === 'banned') {
            return response()->json([
                'error' => 'Your account is banned and cannot create barters.',
                'ban_reason' => $user->ban_reason,
            ], 403);
        }

        $data = $request->validated();

        $barter = Barter::create([
            'status' => 'proposed',
            'exchange_type' => $data['exchange_type'],
            'meeting_location' => $data['meeting_location'] ?? null,
            'meeting_time' => $data['meeting_time'] ?? null,
            'shipping_address_id' => $data['shipping_address_id'] ?? null,
            'shipping_address_text' => $data['shipping_address_text'] ?? null,
            'transaction_fee_amount' =>  50.00,


        ]);

        $barter->participants()->attach(Auth::id(), ['role' => 'offering']);
        $barter->participants()->attach($data['receiver_id'], ['role' => 'requesting']);

        $barter->listings()->attach($data['offered_listing_id'], [
            'owner_user_id' => Auth::id(),
        ]);
        $barter->listings()->attach($data['requested_listing_id'], [
            'owner_user_id' => $data['receiver_id'],
        ]);

        event(new BarterCreated($barter));

        return $barter->load([
            'participants:id,username',
            'listings' => function ($query) {
                $query->select('listings.id', 'listings.title')
                    ->withPivot('owner_user_id')
                    ->with('images:id,listing_id,image_url');
            },
        ]);
    }

    public function show(Barter $barter)
    {
        return $barter->load([
            'participants:id,username',
            'listings' => function ($query) {
                $query->select('listings.id', 'listings.title')
                    ->withPivot('owner_user_id')
                    ->with('images:id,listing_id,image_url');
            },
            'shippingAddress',
            'chat.messages.sender:id,username,profile_picture_url',
            'reviews',
        ]);
    }


    public function update(UpdateBarterRequest $request, Barter $barter)
    {
        $barter->update($request->validated());

        Shipment::create([
            'barter_id' => $barter->id,
            'shipping_type' => 'outbound',
            'status' => 'pending'
        ]);

        return $barter;
    }

    public function destroy(Barter $barter)
    {
        $barter->delete();
        return response('', 204);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:proposed,accepted,completed,cancelled',
        ]);

        $barter = Barter::findOrFail($id);
        if (!$barter->participants->contains('id', Auth::id())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $barter->status = $request->status;
        $barter->save();

        event(new BarterStatusUpdated($barter, Auth::id()));

        return response()->json([
            'message' => 'Barter status updated successfully',
            'barter' => $barter,
        ]);
    }
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'required|string|max:255',
        ]);

        $barter = Barter::findOrFail($id);

        if ($barter->status === 'cancelled') {
            return response()->json(['message' => 'Barter already cancelled'], 400);
        }

        $barter->status = 'cancelled';
        $barter->cancelled_at = now();
        $barter->cancelled_by = auth()->id();
        $barter->cancel_reason = $request->input('cancel_reason');
        $barter->save();

        return response()->json(['message' => 'Barter cancelled successfully']);
    }

    public function cancelledBarters()
    {
        // جلب كل البارترز اللي تم الغاءها
        $barters = Barter::with(['cancelledByUser:id,username'])
            ->where('status', 'cancelled')
            ->latest()
            ->get();

        $data = $barters->map(function ($b) {
            return [
                'id' => $b->id,
                'cancelled_at' => $b->cancelled_at,
                'cancel_reason' => $b->cancel_reason,
                'cancelled_by_id' => $b->cancelled_by,
                'cancelled_by_username' => $b->cancelledByUser->username ?? null,
            ];
        });

        return response()->json($data);
    }
}
