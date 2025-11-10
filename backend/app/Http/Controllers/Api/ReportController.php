<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'reason' => 'required|string|max:500',
        ]);

        $report = Report::create([
            'listing_id' => $request->listing_id,
            'reported_by_user_id' => $request->user()->id,
            'reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report' => $report
        ], 201);
    }
}
