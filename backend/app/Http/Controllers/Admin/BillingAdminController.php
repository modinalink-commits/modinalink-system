<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\Notifier;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingAdminController extends Controller
{
    public function invoices(Request $r)
    {
        return Invoice::with('user:id,name,company')->when($r->status, fn ($q, $s) => $q->where('status', $s))->latest()->paginate(30);
    }

    public function createInvoice(Request $r)
    {
        $d = $r->validate([
            'user_id' => 'required|exists:users,id', 'due_date' => 'nullable|date', 'note' => 'nullable|string|max:250',
            'items' => 'required|array|min:1|max:50',
            'items.*.description' => 'required|string|max:250', 'items.*.qty' => 'required|integer|min:1|max:10000',
            'items.*.unit_bdt' => 'required|integer|min:0|max:1000000000',
        ]);
        return DB::transaction(function () use ($d, $r) {
            $inv = Invoice::create(['number' => Invoice::nextNumber(), 'user_id' => $d['user_id'], 'due_date' => $d['due_date'] ?? null, 'note' => $d['note'] ?? null, 'status' => 'draft']);
            $inv->items()->createMany($d['items']);
            $inv->recalc();
            AuditLog::record($r->user()->id, 'invoice.create', 'invoice', $inv->id);
            return response()->json($inv->load('items'), 201);
        });
    }

    public function issue(Request $r, int $id, Notifier $n)
    {
        $inv = Invoice::with('user')->where('status', 'draft')->findOrFail($id);
        $inv->update(['status' => 'issued', 'issued_at' => now()]);
        AuditLog::record($r->user()->id, 'invoice.issue', 'invoice', $inv->id);
        $n->invoiceIssued($inv);
        return $inv;
    }

    public function void(Request $r, int $id)
    {
        $inv = Invoice::whereIn('status', ['draft', 'issued'])->findOrFail($id);
        $inv->update(['status' => 'void']);
        AuditLog::record($r->user()->id, 'invoice.void', 'invoice', $inv->id);
        return $inv;
    }

    public function payments(Request $r)
    {
        return Payment::with(['invoice:id,number', 'user:id,name'])->when($r->status, fn ($q, $s) => $q->where('status', $s))->latest()->paginate(30);
    }

    /** Staff confirms a bank transfer (or a payment held for amount mismatch) after checking the bank statement. */
    public function verifyPayment(Request $r, int $id, PaymentService $svc)
    {
        $p = Payment::whereIn('status', ['review', 'pending'])->findOrFail($id);
        return $svc->markPaid($p, $p->gateway_txn_id, [], $r->user()->id);
    }

    public function rejectPayment(Request $r, int $id)
    {
        $p = Payment::whereIn('status', ['review', 'pending'])->findOrFail($id);
        $p->update(['status' => 'failed']);
        AuditLog::record($r->user()->id, 'payment.reject', 'payment', $p->id);
        return $p;
    }

    public function subscriptions()
    {
        return Subscription::with('user:id,name')->orderBy('renews_on')->paginate(30);
    }

    public function createSubscription(Request $r)
    {
        $d = $r->validate(['user_id' => 'required|exists:users,id', 'name' => 'required|string|max:150', 'renews_on' => 'required|date', 'amount_bdt' => 'required|integer|min:0']);
        return response()->json(Subscription::create($d), 201);
    }
}
