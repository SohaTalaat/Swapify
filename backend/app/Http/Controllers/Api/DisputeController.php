<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispute\StoreDisputeRequest;
use App\Models\Dispute;
use App\Models\Barter;
use Illuminate\Support\Facades\Auth;

class DisputeController extends Controller
{
    /**
     * Display all disputes related to the authenticated user.
     */
    public function index()
    {
        return Dispute::whereHas('barter.participants', function ($query) {
            $query->where('user_id', Auth::id());
        })
            ->with(['barter:id,status', 'initiator:id,username', 'resolvedByAdmin:id,username'])
            ->latest()
            ->get();
    }

    /**
     * Show details for a specific dispute.
     */
    public function show($id)
    {
        $dispute = Dispute::with(['barter', 'initiator', 'resolvedByAdmin', 'evidence'])
            ->findOrFail($id);

        // Allow access only if the user is a participant or admin
        if (!Auth::user()->is_admin && !$dispute->barter->participants->contains(Auth::id())) {
            abort(403, 'Unauthorized access to this dispute');
        }

        return $dispute;
    }

    /**
     * Create a new dispute for a barter.
     */
    public function store(StoreDisputeRequest $request)
    {
        $data = $request->validated();
        $barter = Barter::findOrFail($data['barter_id']);

        // Ensure the user participated in this barter
        if (!$barter->participants->contains(Auth::id())) {
            abort(403, 'You are not part of this barter');
        }

        // Ensure there’s no existing dispute for this barter
        if (Dispute::where('barter_id', $barter->id)->exists()) {
            abort(400, 'Dispute already exists for this barter');
        }

        $dispute = Dispute::create([
            'barter_id' => $barter->id,
            'initiator_id' => Auth::id(),
            'reason' => $data['reason'],
            'description' => $data['description'],
            'status' => 'open',
        ]);

        return response()->json([
            'message' => 'Dispute created successfully',
            'dispute' => $dispute
        ], 201);
    }
}
