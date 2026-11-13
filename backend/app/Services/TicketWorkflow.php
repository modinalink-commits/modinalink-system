<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\TicketEvent;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Ticket flow: customer ticket -> staff scope check -> AI draft on staging -> staff approve
 * (needs a rollback point) -> deploy -> portal updates.
 * Only staff can move a ticket. Customers can only read and comment.
 */
class TicketWorkflow
{
    public const MAP = [
        'submitted'    => ['scope_review', 'rejected'],
        'scope_review' => ['needs_info', 'rejected', 'drafting'],
        'needs_info'   => ['scope_review', 'rejected'],
        'drafting'     => ['staging_ready', 'needs_info'],
        'staging_ready'=> ['approved', 'drafting', 'needs_info'],
        'approved'     => ['deployed', 'staging_ready'],
        'deployed'     => ['closed', 'approved'],
        'rejected'     => [],
        'closed'       => [],
    ];

    public function __construct(private Notifier $notifier) {}

    public function transition(Ticket $ticket, User $actor, string $to, ?string $note = null, array $data = []): Ticket
    {
        if (! $actor->isStaff()) {
            throw ValidationException::withMessages(['status' => 'Only staff can change ticket status.']);
        }
        $from = $ticket->status;
        if (! in_array($to, self::MAP[$from] ?? [], true)) {
            throw ValidationException::withMessages(['status' => "Cannot move from {$from} to {$to}."]);
        }

        if ($to === 'staging_ready' && empty($data['staging_url'] ?? $ticket->staging_url)) {
            throw ValidationException::withMessages(['staging_url' => 'A staging URL is required.']);
        }
        if ($to === 'approved') {
            $rollback = $data['rollback_point'] ?? $ticket->rollback_point;
            if (empty($rollback)) {
                throw ValidationException::withMessages(['rollback_point' => 'A rollback point is required before approval.']);
            }
            $ticket->rollback_point = $rollback;
            $ticket->approved_by = $actor->id;
            $ticket->approved_at = now();
        }
        if ($to === 'deployed') {
            $ticket->deployed_at = now();
        }
        if (! empty($data['staging_url'])) $ticket->staging_url = $data['staging_url'];

        $ticket->status = $to;
        $ticket->save();

        TicketEvent::create(['ticket_id' => $ticket->id, 'actor_id' => $actor->id, 'from_status' => $from, 'to_status' => $to, 'note' => $note]);
        AuditLog::record($actor->id, 'ticket.transition', 'ticket', $ticket->id, ['from' => $from, 'to' => $to]);

        $this->notifier->ticketUpdated($ticket->fresh('user'));
        return $ticket;
    }
}
