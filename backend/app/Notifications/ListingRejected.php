<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ListingRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private $listing, private $rejectionReason) {}

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
            ->subject('Listing Review Update')
            ->greeting('Hello ' . $notifiable->full_name . ',')
            ->line('Your listing "' . $this->listing->title . '" has been reviewed.')
            ->line('**Reason for rejection:**')
            ->line($this->rejectionReason)
            ->line('You can modify your listing and resubmit it for review.')
            ->action('View My Listings', url('/my-offers'))
            ->line('If you have any questions, please contact our support team.');
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
            'message' => 'Your listing "' . $this->listing->title . '" was rejected.',
            'reason' => $this->rejectionReason,
            'type' => 'listing_rejected',
        ];
    }
}
