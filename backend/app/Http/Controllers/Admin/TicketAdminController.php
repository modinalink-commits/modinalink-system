<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Services\TicketWorkflow;
use Illuminate\Http\Request;

class TicketAdminController extends Controller
{
    public function index(Request $r)
    {
        return Ticket::with('user:id,name,company')->when($r->status, fn ($q, $s) => $q->where('status', $s))->latest()->paginate(30);
    }

    public function show(int $id)
    {
        $t = Ticket::with(['user:id,name,email,phone,company', 'messages.user:id,name,role', 'events'])->findOrFail($id);
        return ['ticket' => $t, 'allowed_next' => TicketWorkflow::MAP[$t->status] ?? []];
    }

    public function transition(Request $r, int $id, TicketWorkflow $wf)
    {
        $d = $r->validate([
            'to' => 'required|in:'.implode(',', array_keys(TicketWorkflow::MAP)),
            'note' => 'nullable|string|max:250', 'staging_url' => 'nullable|url|max:255', 'rollback_point' => 'nullable|string|max:255',
        ]);
        $t = Ticket::with('user')->findOrFail($id);
        return $wf->transition($t, $r->user(), $d['to'], $d['note'] ?? null, $d);
    }

    public function message(Request $r, int $id)
    {
        $d = $r->validate(['body' => 'required|string|max:5000', 'is_internal' => 'boolean', 'ai_assisted' => 'boolean']);
        $t = Ticket::findOrFail($id);
        return response()->json(TicketMessage::create([
            'ticket_id' => $t->id, 'user_id' => $r->user()->id, 'body' => $d['body'],
            'is_internal' => $d['is_internal'] ?? false, 'ai_assisted' => $d['ai_assisted'] ?? false,
        ]), 201);
    }

    public function assign(Request $r, int $id)
    {
        $d = $r->validate(['assigned_to' => 'required|exists:users,id']);
        $t = Ticket::findOrFail($id);
        $t->update($d);
        return $t;
    }
}
