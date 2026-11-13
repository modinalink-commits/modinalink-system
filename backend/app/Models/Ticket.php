<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['approved_at' => 'datetime', 'deployed_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function assignee(): BelongsTo { return $this->belongsTo(User::class, 'assigned_to'); }
    public function messages(): HasMany { return $this->hasMany(TicketMessage::class)->orderBy('id'); }
    public function events(): HasMany { return $this->hasMany(TicketEvent::class)->orderBy('id'); }

    public static function nextNumber(): string
    {
        $n = (static::max('id') ?? 0) + 1;
        return 'TK-'.now()->format('y').'-'.str_pad((string) $n, 5, '0', STR_PAD_LEFT);
    }
}
