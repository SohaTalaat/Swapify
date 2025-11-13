<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Broadcasting\PrivateChannel;

class ShipmentStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $shipment;
    protected $status;

    public function __construct($shipment, $status)
    {
        $this->shipment = $shipment;
        $this->status = $status;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        $barterTitle = optional($this->shipment->barter->listings->first())->title ?? 'your barter';

        return (new MailMessage)
            ->subject("Shipment status updated: " . ucfirst($this->status))
            ->greeting('Hi ' . $notifiable->full_name . ',')
            ->line("The shipment for {$barterTitle} has been updated to: " . ucfirst($this->status) . ".")
            ->line('Tracking Number: ' . ($this->shipment->tracking_number ?? 'N/A'))
            ->action('View Barter', url('/my-barters'))
            ->line('If you have questions contact support.');
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Shipment status updated to ' . $this->status,
            'shipment_id' => $this->shipment->id,
            'status' => $this->status,
            'barter_id' => $this->shipment->barter_id,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function broadcastOn()
    {
        // The framework will broadcast this notification per-notifiable. Use a template
        // channel name so Laravel Echo client subscribing to `private('user.'+id)` receives it.
        return new PrivateChannel('user.{id}');
    }
}
