<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\TicketEvent;
use App\Models\TicketMessage;
use App\Services\Notifier;
use Illuminate\Http\Request;

/** Customer-facing tickets. Customers can create, read and comment. They cannot change status. */
class TicketController extends Controller
{
    private function own(Request $r, int $id): Ticket
    {
        return Ticket::where('user_id', $r->user()->id)->findOrFail($id);
    }

    public function index(Request $r)
    {
        return Ticket::where('user_id', $r->user()->id)->latest()->paginate(20);
    }

    public function store(Request $r, Notifier $n)
    {
        $d = $r->validate(['type' => 'required|in:change,bug,support,new_feature', 'title' => 'required|string|max:200', 'description' => 'required|string|max:8000']);
        $t = Ticket::create($d + ['user_id' => $r->user()->id, 'number' => Ticket::nextNumber(), 'status' => 'submitted']);
        TicketEvent::create(['ticket_id' => $t->id, 'actor_id' => $r->user()->id, 'from_status' => null, 'to_status' => 'submitted']);
        $n->ticketCreated($t->load('user'));
        return response()->json($t, 201);
    }

    public function show(Request $r, int $id)
    {
        $t = $this->own($r, $id);
        return [
            'ticket' => $t->makeHidden(['rollback_point']),
            'messages' => $t->messages()->where('is_internal', false)->with('user:id,name,role')->get()->map(fn ($m) => [
                'id' => $m->id, 'body' => $m->body, 'created_at' => $m->created_at,
                // Customers see "ModinaLink টিম" for staff, never an individual or an AI persona.
                'author' => $m->user->role === 'customer' ? $m->user->name : 'ModinaLink টিম',
                'from_team' => $m->user->role !== 'customer', 'ai_assisted' => $m->ai_assisted,
            ]),
            'events' => $t->events()->get(['from_status', 'to_status', 'created_at']),
            'disclosure' => config('modinalink.disclosure'),
        ];
    }

    public function message(Request $r, int $id)
    {
        $t = $this->own($r, $id);
        if (in_array($t->status, ['closed', 'rejected'], true)) {
            return response()->json(['message' => 'This ticket is closed.'], 422);
        }
        $d = $r->validate(['body' => 'required|string|max:5000']);
        $m = TicketMessage::create(['ticket_id' => $t->id, 'user_id' => $r->user()->id, 'body' => $d['body']]);
        return response()->json($m, 201);
    }
}
