<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['transactional' => 'boolean', 'is_active' => 'boolean'];

    public function render(string $locale, array $vars): string
    {
        $body = $locale === 'en' ? $this->body_en : $this->body_bn;
        foreach ($vars as $k => $v) {
            $body = str_replace('{'.$k.'}', (string) $v, $body);
        }
        return $body;
    }
}
