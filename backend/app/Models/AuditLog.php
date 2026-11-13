<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;
    protected $guarded = ['id'];
    protected $casts = ['meta' => 'array', 'created_at' => 'datetime'];

    public static function record(?int $actorId, string $action, ?string $subjectType = null, ?int $subjectId = null, array $meta = []): void
    {
        static::create([
            'actor_id' => $actorId, 'action' => $action,
            'subject_type' => $subjectType, 'subject_id' => $subjectId,
            'meta' => $meta ?: null, 'ip' => request()?->ip(),
        ]);
    }
}
