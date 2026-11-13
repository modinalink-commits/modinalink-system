<?php

namespace App\Services\Payments;

use App\Models\GatewayConfig;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * SSLCommerz hosted checkout. Credentials keys: store_id, store_password.
 * NOTE: written from the public integration guide and not yet run against the sandbox.
 * Test every step with sandbox credentials before enabling live mode.
 */
class SslcommerzDriver implements GatewayDriver
{
    private function base(GatewayConfig $cfg): string
    {
        return $cfg->mode === 'live' ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
    }

    public function start(GatewayConfig $cfg, Payment $payment, Invoice $invoice, User $user): array
    {
        $c = $cfg->credentials ?? [];
        if (empty($c['store_id']) || empty($c['store_password'])) {
            throw new RuntimeException('SSLCommerz credentials are not set.');
        }
        $api = rtrim(config('app.url'), '/').'/api/webhooks/payment/sslcommerz';
        $res = Http::asForm()->timeout(20)->post($this->base($cfg).'/gwprocess/v4/api.php', [
            'store_id' => $c['store_id'],
            'store_passwd' => $c['store_password'],
            'total_amount' => $payment->amount_bdt,
            'currency' => 'BDT',
            'tran_id' => $payment->tran_id,
            'success_url' => $api, 'fail_url' => $api, 'cancel_url' => $api, 'ipn_url' => $api,
            'cus_name' => $user->name, 'cus_email' => $user->email, 'cus_phone' => $user->phone ?? '01700000000',
            'cus_add1' => 'Bangladesh', 'cus_city' => 'Dhaka', 'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO', 'product_name' => $invoice->number,
            'product_category' => 'service', 'product_profile' => 'general',
        ]);
        $url = $res->json('GatewayPageURL');
        if (! $url) throw new RuntimeException('SSLCommerz did not return a payment page.');
        return ['redirect_url' => $url, 'instructions' => null];
    }

    public function verify(GatewayConfig $cfg, Payment $payment, array $callback): array
    {
        $c = $cfg->credentials ?? [];
        $valId = $callback['val_id'] ?? null;
        if (! $valId) return ['paid' => false, 'amount_bdt' => 0, 'currency' => 'BDT', 'gateway_txn_id' => null, 'raw' => $callback];

        $res = Http::timeout(20)->get($this->base($cfg).'/validator/api/validationserverAPI.php', [
            'val_id' => $valId, 'store_id' => $c['store_id'] ?? '', 'store_passwd' => $c['store_password'] ?? '', 'format' => 'json',
        ]);
        $j = $res->json() ?? [];
        $paid = in_array($j['status'] ?? '', ['VALID', 'VALIDATED'], true) && ($j['tran_id'] ?? null) === $payment->tran_id;
        return [
            'paid' => $paid,
            'amount_bdt' => (int) round((float) ($j['amount'] ?? 0)),
            'currency' => $j['currency_type'] ?? ($j['currency'] ?? 'BDT'),
            'gateway_txn_id' => $j['bank_tran_id'] ?? $valId,
            'raw' => $j,
        ];
    }
}
