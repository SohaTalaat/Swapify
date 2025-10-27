<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReturnRequest\StoreReturnRequest;
use App\Models\ReturnRequest;
use App\Models\Barter;
use Illuminate\Support\Facades\Auth;

class ReturnRequestController extends Controller
{
    /**
     * Display all return requests related to the authenticated user.
     */
    public function index()
    {
        return ReturnRequest::whereHas('barter.participants', function ($query) {
            $query->where('user_id', Auth::id());
        })
            ->with(['barter:id,status', 'requester:id,username'])
            ->latest()
            ->get();
    }

    /**
     * Show details for a specific return request.
     */
    public function show($id)
    {
        $returnRequest = ReturnRequest::with(['barter', 'requester'])
            ->findOrFail($id);

        // Allow access only if the user is involved in the barter
        if (!Auth::user()->is_admin && !$returnRequest->barter->participants->contains(Auth::id())) {
            abort(403, 'Unauthorized access to this return request');
        }

        return $returnRequest;
    }

    /**
     * Create a new return request for a barter.
     */
    public function store(StoreReturnRequest $request)
    {
        $data = $request->validated();
        $barter = Barter::findOrFail($data['barter_id']);

        // Ensure the user participated in this barter
        if (!$barter->participants->contains(Auth::id())) {
            abort(403, 'You are not part of this barter');
        }

        // Ensure no previous return request for this barter
        if (ReturnRequest::where('barter_id', $barter->id)->exists()) {
            abort(400, 'A return request already exists for this barter');
        }

        $returnRequest = ReturnRequest::create([
            'barter_id' => $barter->id,
            'requester_id' => Auth::id(),
            'reason' => $data['reason'],
            'description' => $data['description'],
            'evidence_url' => $data['evidence_url'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Return request created successfully',
            'return_request' => $returnRequest
        ], 201);
    }
}
