<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispute\StoreDisputeRequest;
use App\Models\Dispute;
use App\Models\Barter;
use App\Events\DisputeOpened;
use App\Events\DisputeResolved;
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
        if (!Auth::user()->is_admin && !$dispute->barter->participants->contains('id', Auth::id())) {
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
        if (!$barter->participants->contains('id', Auth::id())) {
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

        // Broadcast the dispute opening to participants and admins
        DisputeOpened::dispatch($dispute);

        return response()->json([
            'message' => 'Dispute created successfully',
            'dispute' => $dispute
        ], 201);
    }

    /**
     * Display all disputes (admin only)
     */
    public function adminIndex()
    {
        $disputes = Dispute::with([
            'barter:id,status,created_at',
            'barter.participants:id,username,email',
            'barter.listings:id,title',
            'initiator:id,username,email,profile_picture_url',
            'resolvedByAdmin:id,username'
        ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($disputes);
    }

    /**
     * Resolve a dispute (admin only)
     */
    public function adminResolve($id)
    {
        $dispute = Dispute::findOrFail($id);
        $data = request()->validate([
            'resolution_notes' => 'required|string|max:1000',
            'status' => 'required|in:resolved,closed'
        ]);

        $dispute->update([
            'status' => $data['status'],
            'resolution_notes' => $data['resolution_notes'],
            'resolved_by_admin_id' => Auth::id(),
            'resolved_at' => now()
        ]);

        // Broadcast the resolution to admin channel for real-time updates
        DisputeResolved::dispatch($dispute);

        // Create an application notification record (matches other notification flows)
        try {
            $initiator = $dispute->initiator;
            if ($initiator) {
                $notification = \App\Models\Notification::create([
                    'user_id' => $initiator->id,
                    'type' => 'dispute_resolved',
                    'message' => 'Your dispute #' . $dispute->id . ' has been resolved.',
                    'is_read' => false,
                    'related_barter_id' => $dispute->barter_id,
                    'related_user_id' => $dispute->resolved_by_admin_id,
                ]);

                // Broadcast existing internal notification event so frontend picks it up
                event(new \App\Events\UserNotificationCreated($notification));

                // Also send a Laravel Mail/Database/Broadcast notification for external channels
                try {
                    $initiator->notify(new \App\Notifications\DisputeResolvedNotification($dispute));
                } catch (\Exception $e) {
                    logger()->error('Failed to send Laravel notification for dispute_resolved: ' . $e->getMessage());
                }
            }
        } catch (\Exception $e) {
            // Fail silently but log the exception so we don't break admin flow
            logger()->error('Failed to create application notification for dispute initiator: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Dispute resolved',
            'dispute' => $dispute
        ]);
    }
}
