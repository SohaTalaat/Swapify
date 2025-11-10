<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function index()
    {
        $reports = Report::with(['listing:id,title', 'reporter:id,full_name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $reports->map(function ($r) {
                return [
                    'id' => $r->id,
                    'listing_title' => $r->listing->title ?? 'Deleted Listing',
                    'reported_by' => $r->reporter->full_name ?? 'N/A',
                    'reason' => $r->reason,
                    'status' => $r->status,
                    'created_at' => $r->created_at->diffForHumans(),
                ];
            })
        ]);
    }

    public function removeOffer($id)
    {
        $report = Report::findOrFail($id);
        $listing = $report->listing;

        if ($listing) {
            $listing->update(['is_active' => false]);
            $report->update(['status' => 'removed']);
        }

        return response()->json(['message' => 'Offer has been removed.']);
    }

    public function dismiss($id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'reviewed']);

        return response()->json(['message' => 'Report dismissed.']);
    }
}
