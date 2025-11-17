<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;
use \Cloudinary\Api\Upload\UploadApi;
use App\Notifications\ShipmentStatusUpdated;
use Illuminate\Support\Facades\Log;

class AdminShipmentController extends Controller
{
    /**
     * Show all shipments
     */
    public function index()
    {
        $shipments = Shipment::with(['barter.listings:id,title'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($shipments);
    }

    /**
     * Update shipment status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,picked_up,in_transit,delivered,failed'
        ]);

        $shipment = Shipment::findOrFail($id);
        $shipment->update([
            'status' => $request->status,
            'picked_up_at' => $request->status === 'picked_up' ? now() : $shipment->picked_up_at,
            'delivered_at' => $request->status === 'delivered' ? now() : $shipment->delivered_at,
        ]);

        // notify both barter participants about the status change (send immediately during testing)
        try {
            $barter = $shipment->barter()->with('participants')->first();
            if ($barter && $barter->participants) {
                foreach ($barter->participants as $participant) {
                    try {
                        $participant->notifyNow(new ShipmentStatusUpdated($shipment, $shipment->status));
                    } catch (\Exception $e) {
                        Log::error('Failed to notify participant about shipment status update: ' . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Error while notifying participants after shipment status update: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Shipment status updated successfully']);
    }

    /**
     * Upload photos (pickup or delivery)
     */
    public function uploadPhoto(Request $request, $id)
    {
        $request->validate([
            'photo' => 'required|image|max:4096',
            'type' => 'required|in:pickup,delivery'
        ]);

        try {
            $upload = (new UploadApi())->upload(
                $request->file('photo')->getRealPath(),
                [
                    'folder' => 'swapify/shipments',
                    'public_id' => "shipment_{$id}_" . $request->type . '_' . time(),
                ]
            );

            $shipment = Shipment::findOrFail($id);
            $column = $request->type === 'pickup' ? 'pickup_photo_url' : 'delivery_photo_url';
            $shipment->update([$column => $upload['secure_url']]);

            return response()->json([
                'message' => ucfirst($request->type) . ' photo uploaded successfully',
                'url' => $upload['secure_url']
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }
}
