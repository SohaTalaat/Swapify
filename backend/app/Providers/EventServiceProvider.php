<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \App\Events\NewMessageSent::class => [
            \App\Listeners\CreateMessageNotification::class,
        ],
        \App\Events\BarterStatusUpdated::class => [
            \App\Listeners\CreateBarterStatusNotification::class,
        ],
        \App\Events\DisputeOpened::class => [
            \App\Listeners\CreateDisputeNotification::class,
        ],
        \App\Events\NewReviewCreated::class => [
            \App\Listeners\CreateReviewNotification::class,
        ],
        \App\Events\ReturnRequestCreated::class => [
            \App\Listeners\CreateReturnRequestNotification::class,
        ],
        \App\Events\UserNotificationCreated::class => [],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
