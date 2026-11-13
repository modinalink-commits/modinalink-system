<?php

namespace App\Services\Payments;

use App\Models\GatewayConfig;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;

interface GatewayDriver
{
    /** Start a payment. Returns ['redirect_url' => string|null, 'instructions' => array|null]. */
    public function start(GatewayConfig $cfg, Payment $payment, Invoice $invoice, User $user): array;

    /**
     * Verify a callback from the gateway on the server side (never trust the browser redirect).
     * Returns ['paid' => bool, 'amount_bdt' => int, 'currency' => string, 'gateway_txn_id' => ?string, 'raw' => array].
     */
    public function verify(GatewayConfig $cfg, Payment $payment, array $callback): array;
}
