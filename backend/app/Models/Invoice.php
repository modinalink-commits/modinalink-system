<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['due_date' => 'date', 'issued_at' => 'datetime', 'paid_at' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(InvoiceItem::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }

    public static function nextNumber(): string
    {
        $n = (static::max('id') ?? 0) + 1;
        return 'INV-'.now()->format('y').'-'.str_pad((string) $n, 5, '0', STR_PAD_LEFT);
    }

    public function recalc(): void
    {
        $this->total_bdt = (int) $this->items()->get()->sum(fn ($i) => $i->qty * $i->unit_bdt);
        $this->save();
    }
}
