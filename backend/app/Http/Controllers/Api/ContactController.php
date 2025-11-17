<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactRequest;
use App\Notifications\ContactNotification;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class ContactController extends Controller
{
    /**
     * Submit a contact form
     */
    public function store(StoreContactRequest $request)
    {
        $data = $request->validated();

        try {
            // Send email to admin
            Notification::route('mail', 'swapifyservices@gmail.com')
                ->notify(new ContactNotification($data));

            return response()->json([
                'message' => 'Your message has been sent successfully! We\'ll get back to you soon.',
                'status' => 'success'
            ], 201);
        } catch (\Exception $e) {
            logger()->error('Failed to send contact email: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to send message. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
