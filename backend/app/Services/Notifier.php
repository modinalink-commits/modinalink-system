<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Ticket;
use App\Models\User;

/** Central place that decides which SMS template goes out for which event. */
class Notifier
{
    public function __construct(private SmsService $sms) {}

    public function ticketCreated(Ticket $t): void
    {
        $this->sms->sendTemplate($t->user, 'ticket_created', ['ticket' => $t->number]);
    }

    public function ticketUpdated(Ticket $t): void
    {
        $key = $t->status === 'staging_ready' ? 'preview_ready' : 'ticket_updated';
        $this->sms->sendTemplate($t->user, $key, [
            'ticket' => $t->number,
            'link' => rtrim(config('modinalink.frontend_url'), '/').'/portal/tickets/'.$t->id,
        ]);
    }

    public function invoiceIssued(Invoice $i): void
    {
        $this->sms->sendTemplate($i->user, 'invoice_issued', [
            'amount' => number_format($i->total_bdt),
            'due_date' => optional($i->due_date)->format('d/m/Y') ?? '',
            'link' => rtrim(config('modinalink.frontend_url'), '/').'/portal/invoices/'.$i->id,
        ]);
    }

    public function paymentReceived(Payment $p): void
    {
        $this->sms->sendTemplate($p->user, 'payment_received', ['amount' => number_format($p->amount_bdt)]);
    }

    public function renewalReminder(Subscription $s, User $u): void
    {
        $this->sms->sendTemplate($u, 'renewal_reminder', [
            'due_date' => $s->renews_on->format('d/m/Y'),
            'link' => rtrim(config('modinalink.frontend_url'), '/').'/portal/subscriptions',
        ]);
    }
}
