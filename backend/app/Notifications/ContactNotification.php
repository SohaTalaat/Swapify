<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ContactNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $contactData;

    public function __construct(array $contactData)
    {
        $this->contactData = $contactData;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Contact Form Submission from Swapify')
            ->greeting('Hello Swapify Team!')
            ->line('A new contact message has been submitted:')
            ->line('---')
            ->line('**Name:** ' . $this->contactData['name'])
            ->line('**Email:** ' . $this->contactData['email'])
            ->line('**Message:**')
            ->line($this->contactData['message'])
            ->line('---')
            ->action('Reply to ' . $this->contactData['email'], 'mailto:' . $this->contactData['email'])
            ->line('Submitted at: ' . now()->format('Y-m-d H:i:s'));
    }
}
