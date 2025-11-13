<?php

namespace App\Notifications;

use App\Models\Dispute;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class DisputeResolvedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Dispute $dispute;

    public function __construct(Dispute $dispute)
    {
        $this->dispute = $dispute;
        $this->onQueue('notifications');
    }

    public function via($notifiable)
    {
        // Send via mail, database and broadcast (for Echo)
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        $url = url('/disputes/' . $this->dispute->id);

        return (new MailMessage)
            ->subject('Your dispute has been resolved')
            ->greeting('Hello ' . ($notifiable->username ?? 'user') . ',')
            ->line('Your dispute #' . $this->dispute->id . ' has been resolved by our team.')
            ->line('Status: ' . ucfirst($this->dispute->status))
            ->line('Resolution notes: ' . ($this->dispute->resolution_notes ?? '—'))
            ->action('View Dispute', $url)
            ->line('If you have further questions, reply to this email or contact support.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'dispute_resolved',
            'message' => 'Your dispute #' . $this->dispute->id . ' has been resolved',
            'dispute_id' => $this->dispute->id,
            'barter_id' => $this->dispute->barter_id,
            'related_barter_id' => $this->dispute->barter_id,
            'status' => $this->dispute->status,
            'resolution_notes' => $this->dispute->resolution_notes,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function broadcastOn()
    {
        // Broadcast to the user's private channel so frontend Echo receives via `private('user.{id}')`
        return new \Illuminate\Broadcasting\PrivateChannel('user.{id}');
    }
}
