<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ListingApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private $listing) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Listing Has Been Approved!')
            ->greeting('Hello ' . $notifiable->full_name . ',')
            ->line('Great news! Your listing "' . $this->listing->title . '" has been approved.')
            ->line('Your listing is now visible to all users on Swapify.')
            ->action('View Listing', url('/offer-details/' . $this->listing->id))
            ->line('Thank you for using Swapify!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'message' => 'Your listing "' . $this->listing->title . '" has been approved!',
            'type' => 'listing_approved',
        ];
    }
}
