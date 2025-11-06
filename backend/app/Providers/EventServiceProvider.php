<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
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
    ];
}
