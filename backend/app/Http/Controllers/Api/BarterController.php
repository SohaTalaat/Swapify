<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barter;
use App\Models\Listing;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Barter\StoreBarterRequest;
use App\Http\Requests\Barter\UpdateBarterRequest;
use Illuminate\Http\Request;

class BarterController extends Controller
{
    /**
     */
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
    $data = $request->validated();

    $barter = Barter::create([
        'status' => 'proposed',
        'exchange_type' => $data['exchange_type'],
        'meeting_location' => $data['meeting_location'] ?? null,
        'meeting_time' => $data['meeting_time'] ?? null,
        'shipping_address_id' => $data['shipping_address_id'] ?? null,
    ]);

    $barter->participants()->attach(Auth::id(), ['role' => 'offering']);
    $barter->participants()->attach($data['receiver_id'], ['role' => 'requesting']);

    $barter->listings()->attach($data['offered_listing_id'], [
        'owner_user_id' => Auth::id(),
    ]);
    $barter->listings()->attach($data['requested_listing_id'], [
        'owner_user_id' => $data['receiver_id'],
    ]);

    return $barter->load([
        'participants:id,username',
        'listings' => function ($query) {
            $query->select('listings.id', 'listings.title')
                  ->withPivot('owner_user_id')
                  ->with('images:id,listing_id,image_url');
        },
    ]);
}

    /**
     */
public function show(Barter $barter)
{
    return $barter->load([
        'participants:id,username',
        'listings' => function ($query) {
            $query->select('listings.id', 'listings.title')
                  ->withPivot('owner_user_id') // ✅ نجيب بيانات pivot
                  ->with('images:id,listing_id,image_url');
        },
        'shippingAddress',
        'chat.messages.user:id,username',
        'reviews',
    ]);
}



    /**
     */
    public function update(UpdateBarterRequest $request, Barter $barter)
    {
        $barter->update($request->validated());
        return $barter;
    }

    /**
     */
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
    $barter->status = $request->status;
    $barter->save();

    return response()->json([
        'message' => 'Barter status updated successfully',
        'barter' => $barter,
    ]);
}


}
