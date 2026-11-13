<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketMessage extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['is_internal' => 'boolean', 'ai_assisted' => 'boolean'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function ticket(): BelongsTo { return $this->belongsTo(Ticket::class); }
}
