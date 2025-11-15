<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminListingController extends Controller
{
    public function index()
    {
        $listings = Listing::with(['category:id,name', 'user:id,full_name,email'])
            ->select('id', 'title', 'category_id', 'user_id', 'is_active', 'approval_status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => $listings->map(function ($listing) {
                return [
                    'id' => $listing->id,
                    'title' => $listing->title,
                    'category' => $listing->category->name ?? 'Unknown',
                    'is_active' => (bool) $listing->is_active,
                    'approval_status' => $listing->approval_status,
                    'user_name' => $listing->user->full_name ?? 'N/A',
                    'image_url' => $listing->images->first()->image_url ?? null,
                    'created_at' => $listing->created_at->toDateTimeString(),
                ];
            }),
            'meta' => [
                'total' => $listings->total(),
                'per_page' => $listings->perPage(),
                'current_page' => $listings->currentPage(),
            ],
        ]);
    }

    public function toggleStatus($id)
    {
        $listing = Listing::findOrFail($id);
        $listing->is_active = !$listing->is_active;
        $listing->save();

        return response()->json([
            'message' => "Listing status updated.",
            'is_active' => $listing->is_active
        ]);
    }

    public function approveListing($id)
    {
        $listing = Listing::findOrFail($id);

        $listing->update([
            'approval_status' => 'approved',
            'reviewed_by_admin_id' => Auth::id(),
            'reviewed_at' => now(),
            'is_active' => true, // Auto-activate on approval
        ]);

        // Notify user
        try {
            $listing->user->notify(new \App\Notifications\ListingApproved($listing));
        } catch (\Exception $e) {
            Log::error('Failed to notify user about listing approval: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Listing approved successfully',
            'listing' => $listing
        ]);
    }

    public function rejectListing(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $listing = Listing::findOrFail($id);

        $listing->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'reviewed_by_admin_id' => Auth::id(),
            'reviewed_at' => now(),
            'is_active' => false,
        ]);

        // Notify user
        try {
            $listing->user->notify(new \App\Notifications\ListingRejected($listing, $request->rejection_reason));
        } catch (\Exception $e) {
            Log::error('Failed to notify user about listing rejection: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Listing rejected',
            'listing' => $listing
        ]);
    }
}
