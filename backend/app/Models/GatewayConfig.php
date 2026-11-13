<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GatewayConfig extends Model
{
    public const GATEWAYS = ['bkash', 'nagad', 'rocket', 'sslcommerz', 'aamarpay', 'bank'];

    protected $guarded = ['id'];
    protected $hidden = ['credentials'];
    protected $casts = ['enabled' => 'boolean', 'credentials' => 'encrypted:array', 'fee_percent' => 'float'];

    /** Names of stored credential keys, never their values. */
    public function credentialKeys(): array
    {
        return array_keys($this->credentials ?? []);
    }
}
