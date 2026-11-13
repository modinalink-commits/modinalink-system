<?php

namespace App\Http\Controllers;

use App\Models\GatewayConfig;
use App\Models\Invoice;
use App\Models\PermissionGrant;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BillingController extends Controller
{
    public function invoices(Request $r)
    {
        return Invoice::where('user_id', $r->user()->id)->where('status', '!=', 'draft')->latest()->paginate(20);
    }

    public function invoice(Request $r, int $id)
    {
        return Invoice::where('user_id', $r->user()->id)->where('status', '!=', 'draft')->with(['items', 'payments:id,invoice_id,gateway,status,amount_bdt,created_at'])->findOrFail($id);
    }

    /** Only enabled methods, never credentials. */
    public function methods()
    {
        return GatewayConfig::where('enabled', true)->get(['gateway', 'mode', 'fee_percent']);
    }

    public function pay(Request $r, int $id, PaymentService $svc)
    {
        $d = $r->validate(['gateway' => 'required|in:'.implode(',', GatewayConfig::GATEWAYS)]);
        $inv = Invoice::where('user_id', $r->user()->id)->findOrFail($id);
        try {
            return $svc->start($inv, $r->user(), $d['gateway']);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages(['gateway' => $e->getMessage()]);
        }
    }

    /** Bank transfer: customer submits their transfer reference. Staff verifies. */
    public function bankProof(Request $r, int $paymentId)
    {
        $d = $r->validate(['reference' => 'required|string|max:120']);
        $p = Payment::where('user_id', $r->user()->id)->where('gateway', 'bank')->where('status', 'pending')->findOrFail($paymentId);
        $p->update(['proof_reference' => $d['reference'], 'status' => 'review']);
        return $p;
    }

    public function subscriptions(Request $r)
    {
        return $r->user()->subscriptions()->orderBy('renews_on')->get();
    }

    public function grants(Request $r)
    {
        return ['scopes' => PermissionGrant::SCOPES, 'granted' => $r->user()->grants()->pluck('scope')];
    }
}
