<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

class ChatAdminController extends Controller
{
    public function index(Request $r)
    {
        return ChatConversation::with('user:id,name,company')
            ->withCount('messages')
            ->when($r->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByRaw("status = 'open' desc")->orderByDesc('last_message_at')->limit(60)->get();
    }

    public function show(Request $r, int $id)
    {
        $c = ChatConversation::with('user:id,name,company,email,phone')->findOrFail($id);
        return [
            'conversation' => $c,
            'messages' => $c->messages()->where('id', '>', (int) $r->query('after_id', 0))->orderBy('id')->limit(200)->get(['id', 'from_staff', 'body', 'created_at']),
        ];
    }

    public function send(Request $r, int $id)
    {
        $d = $r->validate(['body' => 'required|string|max:2000']);
        $c = ChatConversation::where('status', 'open')->findOrFail($id);
        $m = ChatMessage::create(['conversation_id' => $c->id, 'user_id' => $r->user()->id, 'from_staff' => true, 'body' => $d['body']]);
        $c->update(['last_message_at' => now()]);
        return $m;
    }

    public function close(int $id)
    {
        ChatConversation::findOrFail($id)->update(['status' => 'closed']);
        return response()->noContent();
    }
}
