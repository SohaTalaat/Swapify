<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class AdminListingController extends Controller
{
    public function index()
    {
        $listings = Listing::with(['category:id,name', 'user:id,full_name,email'])
            ->select('id', 'title', 'category_id', 'user_id', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => $listings->map(function ($listing) {
                return [
                    'id' => $listing->id,
                    'title' => $listing->title,
                    'category' => $listing->category->name ?? 'Unknown',
                    'is_active' => (bool) $listing->is_active,
                    'user_name' => $listing->user->full_name ?? 'N/A',
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
}
