<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\GatewayConfig;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payments\BankTransferDriver;
use App\Services\Payments\GatewayDriver;
use App\Services\Payments\SslcommerzDriver;
use App\Services\Payments\UnavailableDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(private Notifier $notifier) {}

    public function driver(string $gateway): GatewayDriver
    {
        return match ($gateway) {
            'sslcommerz' => new SslcommerzDriver(),
            'bank' => new BankTransferDriver(),
            default => new UnavailableDriver($gateway),
        };
    }

    public function start(Invoice $invoice, User $user, string $gateway): array
    {
        if ($invoice->status !== 'issued') {
            throw ValidationException::withMessages(['invoice' => 'This invoice cannot be paid.']);
        }
        $cfg = GatewayConfig::where('gateway', $gateway)->where('enabled', true)->first();
        if (! $cfg) throw ValidationException::withMessages(['gateway' => 'This payment method is not available.']);

        // Amount always comes from the invoice on the server, never from the client.
        $payment = Payment::create([
            'invoice_id' => $invoice->id, 'user_id' => $user->id, 'gateway' => $gateway,
            'status' => 'pending', 'amount_bdt' => $invoice->total_bdt,
            'tran_id' => strtoupper('ML'.Str::random(14)),
        ]);
        $out = $this->driver($gateway)->start($cfg, $payment, $invoice, $user);
        return ['payment_id' => $payment->id, 'tran_id' => $payment->tran_id] + $out;
    }

    /** Called from the gateway webhook. Idempotent, verifies server-side, checks amount. */
    public function handleCallback(string $gateway, array $callback): ?Payment
    {
        $tranId = $callback['tran_id'] ?? null;
        $payment = $tranId ? Payment::where('tran_id', $tranId)->where('gateway', $gateway)->first() : null;
        if (! $payment) return null;
        if ($payment->status === 'paid') return $payment; // already processed (idempotent)

        $cfg = GatewayConfig::where('gateway', $gateway)->first();
        if (! $cfg) return $payment;

        $v = $this->driver($gateway)->verify($cfg, $payment, $callback);

        if (! $v['paid']) {
            $payment->update(['status' => 'failed', 'payload' => $v['raw']]);
            return $payment;
        }
        if ($v['currency'] !== 'BDT' || (int) $v['amount_bdt'] !== (int) $payment->amount_bdt) {
            // Paid but amount or currency differs: hold for staff review, do not mark invoice paid.
            $payment->update(['status' => 'review', 'gateway_txn_id' => $v['gateway_txn_id'], 'payload' => $v['raw']]);
            AuditLog::record(null, 'payment.amount_mismatch', 'payment', $payment->id, ['expected' => $payment->amount_bdt, 'got' => $v['amount_bdt']]);
            return $payment;
        }
        return $this->markPaid($payment, $v['gateway_txn_id'], $v['raw'], null);
    }

    public function markPaid(Payment $payment, ?string $gatewayTxn, array $raw, ?int $verifiedBy): Payment
    {
        return DB::transaction(function () use ($payment, $gatewayTxn, $raw, $verifiedBy) {
            $p = Payment::whereKey($payment->id)->lockForUpdate()->first();
            if ($p->status === 'paid') return $p;
            $p->update([
                'status' => 'paid', 'gateway_txn_id' => $gatewayTxn, 'payload' => $raw ?: null,
                'verified_at' => now(), 'verified_by' => $verifiedBy,
            ]);
            Invoice::whereKey($p->invoice_id)->update(['status' => 'paid', 'paid_at' => now()]);
            AuditLog::record($verifiedBy, 'payment.paid', 'payment', $p->id, ['gateway' => $p->gateway]);
            $this->notifier->paymentReceived($p->fresh('user'));
            return $p;
        });
    }
}
