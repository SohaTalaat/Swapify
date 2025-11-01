<?php

namespace App\Events;

use App\Models\Barter;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BarterStatusUpdated
{
    use Dispatchable, SerializesModels;

    public Barter $barter;

    public function __construct(Barter $barter)
    {
        $this->barter = $barter;
    }
}
