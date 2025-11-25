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
use App\Models\Subscription;
use Illuminate\Http\Request;

class BarterController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */

        $user = Auth::user();

        return $user
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

        // ✅ Check subscription barter limit
        $subscription = $user->subscription;
        $barterLimit = $this->getBarterLimitForUser($subscription);
        // Count ALL barter requests (including cancelled) - any barter request counts toward the limit
        $activeBarterCount = Barter::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        if ($activeBarterCount >= $barterLimit) {
            return response()->json([
                'error' => 'You have reached your barter limit',
                'code' => 'BARTER_LIMIT_EXCEEDED',
                'current_limit' => $barterLimit,
                'barters_used' => $activeBarterCount,
                'plans' => [
                    ['tier' => 'free', 'limit' => 2, 'price' => 0, 'duration' => 'lifetime'],
                    ['tier' => 'basic', 'limit' => 5, 'price' => 2500],
                    ['tier' => 'pro', 'limit' => 10, 'price' => 5000],
                ],
                'message' => 'Upgrade your subscription to create more barters'
            ], 402);
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

        // Increment barters_used in subscription
        if ($subscription) {
            $subscription->increment('barters_used');
        }
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

    /**
     * Get barter limit based on subscription tier
     */
    private function getBarterLimitForUser($subscription)
    {
        if (!$subscription || !$subscription->is_active) {
            return 2; // Free plan default
        }

        $tierLimits = ['free' => 2, 'basic' => 5, 'pro' => 10];
        return $tierLimits[$subscription->tier] ?? 2;
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
        // If barter was accepted and requires delivery, create a shipment record if not exists
        try {
            if ($request->status === 'accepted' && $barter->exchange_type === 'delivery') {
                $existing = Shipment::where('barter_id', $barter->id)->first();
                if (!$existing) {
                    $shipment = Shipment::create([
                        'barter_id' => $barter->id,
                        'shipping_type' => 'outbound',
                        'status' => 'pending',
                    ]);

                    // notify participants immediately (bypass queue during testing)
                    foreach ($barter->participants as $participant) {
                        try {
                            $participant->notifyNow(new \App\Notifications\ShipmentStatusUpdated($shipment, $shipment->status));
                        } catch (\Exception $e) {
                            // avoid breaking the status update if notification fails
                            \Illuminate\Support\Facades\Log::error('Failed to notify participant about shipment creation: ' . $e->getMessage());
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error while creating shipment on barter accepted: ' . $e->getMessage());
        }

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
        $barter->cancelled_by = Auth::id();
        $barter->cancel_reason = $request->input('cancel_reason');
        $barter->save();

        return response()->json(['message' => 'Barter cancelled successfully']);
    }

    public function cancelledBarters()
    {
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
