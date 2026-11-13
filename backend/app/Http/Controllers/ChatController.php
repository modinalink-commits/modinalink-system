<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

/** Customer side of live chat. A chat starts only after the customer gives a phone number and an email. */
class ChatController extends Controller
{
    private function mine(Request $r): ?ChatConversation
    {
        return ChatConversation::where('user_id', $r->user()->id)->where('status', 'open')->latest('id')->first();
    }

    private function payload(ChatConversation $c, int $after = 0): array
    {
        return [
            'conversation' => $c->only(['id', 'status', 'phone', 'email']),
            'messages' => $c->messages()->where('id', '>', $after)->orderBy('id')->limit(200)->get(['id', 'from_staff', 'body', 'created_at']),
        ];
    }

    public function show(Request $r)
    {
        $c = $this->mine($r);
        return $c ? $this->payload($c, (int) $r->query('after_id', 0)) : ['conversation' => null, 'messages' => []];
    }

    public function start(Request $r)
    {
        $d = $r->validate([
            'phone' => ['required', 'regex:/^(?:\+?88)?01[3-9]\d{8}$/'],
            'email' => 'required|email|max:190',
        ], ['phone.regex' => 'সঠিক মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)।']);
        $c = $this->mine($r) ?? ChatConversation::create(['user_id' => $r->user()->id, 'phone' => $d['phone'], 'email' => $d['email'], 'last_message_at' => now()]);
        return $this->payload($c);
    }

    public function send(Request $r)
    {
        $d = $r->validate(['body' => 'required|string|max:2000']);
        $c = $this->mine($r);
        abort_unless($c, 422, 'আগে মোবাইল নম্বর ও ইমেইল দিয়ে চ্যাট শুরু করুন।');
        $m = ChatMessage::create(['conversation_id' => $c->id, 'user_id' => $r->user()->id, 'from_staff' => false, 'body' => $d['body']]);
        $c->update(['last_message_at' => now()]);
        return $m;
    }

    public function close(Request $r)
    {
        $c = $this->mine($r);
        if ($c) $c->update(['status' => 'closed']);
        return response()->noContent();
    }
}
