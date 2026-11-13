<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\SmsLog;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    /** The browser is redirected here by the gateway, but the result is only trusted after server-side verification. */
    public function payment(Request $r, string $gateway, PaymentService $svc)
    {
        $payment = $svc->handleCallback($gateway, $r->all());
        $base = rtrim(config('modinalink.frontend_url'), '/').'/portal/invoices';
        if ($r->isMethod('get') || $r->hasHeader('Referer') || $r->has('val_id')) {
            $ok = $payment && $payment->status === 'paid' ? 'success' : ($payment && $payment->status === 'review' ? 'review' : 'failed');
            return redirect()->away($base.($payment ? '/'.$payment->invoice_id : '')."?payment={$ok}");
        }
        return response()->json(['ok' => true]);
    }

    /** SMS delivery report. Requires ?token= matching the configured webhook secret. */
    public function smsDlr(Request $r)
    {
        $secret = Setting::read('sms_webhook_token');
        abort_unless($secret && hash_equals((string) $secret, (string) $r->query('token')), 403);
        $id = $r->input('message_id') ?? $r->input('msg_id');
        $status = strtolower((string) $r->input('status'));
        if ($id && ($log = SmsLog::where('provider_message_id', $id)->first())) {
            $log->update(['status' => str_contains($status, 'deliver') ? 'delivered' : (str_contains($status, 'fail') ? 'failed' : $log->status)]);
        }
        return response()->json(['ok' => true]);
    }
}
