<?php

namespace App\Events;

use App\Models\Tenant;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TenantProvisioningFailed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Tenant $tenant;
    public string $errorMessage;

    /**
     * Create a new event instance.
     */
    public function __construct(Tenant $tenant, string $errorMessage)
    {
        $this->tenant = $tenant;
        $this->errorMessage = $errorMessage;
    }
}
