<?php

namespace App\Http\Controllers\Api;

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
    /**
     * عرض جميع المقايضات الخاصة بالمستخدم
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

    /**
     * إنشاء مقايضة جديدة
     */
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

        // ربط الأطراف بالمقايضة
        $barter->participants()->attach(Auth::id(), ['role' => 'offering']);
        $barter->participants()->attach($data['receiver_id'], ['role' => 'requesting']);

        // ربط القوائم (العروض والطلبات)
        $barter->listings()->attach($data['offered_listing_id'], [
            'owner_user_id' => Auth::id(),
        ]);
        $barter->listings()->attach($data['requested_listing_id'], [
            'owner_user_id' => $data['receiver_id'],
        ]);

        event(new BarterStatusUpdated($barter->load('participants')));

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
     * عرض تفاصيل مقايضة معينة
     */
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
            // ✅ هنا التعديل الأساسي
            'chat.messages.sender:id,username,profile_picture_url',
            'reviews',
        ]);
    }

    /**
     * تحديث بيانات المقايضة
     */
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

    /**
     * حذف مقايضة
     */
    public function destroy(Barter $barter)
    {
        $barter->delete();
        return response('', 204);
    }

    /**
     * تحديث حالة المقايضة (proposed / accepted / completed / cancelled)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:proposed,accepted,completed,cancelled',
        ]);

        $barter = Barter::findOrFail($id);
        $barter->status = $request->status;
        $barter->save();

        event(new BarterStatusUpdated($barter->load('participants')));

        return response()->json([
            'message' => 'Barter status updated successfully',
            'barter' => $barter,
        ]);
    }
}
