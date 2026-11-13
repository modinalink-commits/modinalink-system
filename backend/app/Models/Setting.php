<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['secret' => 'boolean'];

    public static function read(string $key, mixed $default = null): mixed
    {
        $row = static::find($key);
        if (! $row || $row->value === null) return $default;
        $raw = $row->secret ? Crypt::decryptString($row->value) : $row->value;
        $decoded = json_decode($raw, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $raw;
    }

    public static function write(string $key, mixed $value, bool $secret = false): void
    {
        $raw = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);
        static::updateOrCreate(['key' => $key], [
            'value' => $secret ? Crypt::encryptString($raw) : $raw,
            'secret' => $secret,
        ]);
    }
}
