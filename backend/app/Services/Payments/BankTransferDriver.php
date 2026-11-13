<?php

namespace App\Services\Payments;

use App\Models\GatewayConfig;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;

/** Manual bank transfer. Customer pays outside, submits a reference, staff verifies. */
class BankTransferDriver implements GatewayDriver
{
    public function start(GatewayConfig $cfg, Payment $payment, Invoice $invoice, User $user): array
    {
        $c = $cfg->credentials ?? [];
        return [
            'redirect_url' => null,
            'instructions' => [
                'bank_name' => $c['bank_name'] ?? '',
                'account_name' => $c['account_name'] ?? '',
                'account_number' => $c['account_number'] ?? '',
                'branch' => $c['branch'] ?? '',
                'reference' => $payment->tran_id,
            ],
        ];
    }

    public function verify(GatewayConfig $cfg, Payment $payment, array $callback): array
    {
        // Bank transfers are verified by staff, never automatically.
        return ['paid' => false, 'amount_bdt' => 0, 'currency' => 'BDT', 'gateway_txn_id' => null, 'raw' => []];
    }
}
