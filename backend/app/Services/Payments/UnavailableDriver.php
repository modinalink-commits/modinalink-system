<?php

namespace App\Services\Payments;

use App\Models\GatewayConfig;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use RuntimeException;

/**
 * Placeholder for gateways that need the provider's merchant documentation and credentials
 * (bKash, Nagad, Rocket, aamarPay). Replace with a real driver after merchant approval.
 */
class UnavailableDriver implements GatewayDriver
{
    public function __construct(private string $name) {}

    public function start(GatewayConfig $cfg, Payment $payment, Invoice $invoice, User $user): array
    {
        throw new RuntimeException("{$this->name} driver is not implemented yet. Add it after merchant approval and API documentation.");
    }

    public function verify(GatewayConfig $cfg, Payment $payment, array $callback): array
    {
        throw new RuntimeException("{$this->name} driver is not implemented yet.");
    }
}
