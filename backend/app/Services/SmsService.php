<?php

namespace App\Services;

use App\Jobs\SendSmsJob;
use App\Models\Setting;
use App\Models\SmsLog;
use App\Models\SmsTemplate;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

/**
 * Provider-agnostic SMS sender. Bangladeshi SMS providers differ in field names, so the
 * admin stores the endpoint and the parameter names, and this class builds the request.
 * Settings key `sms_provider` (encrypted):
 *   url, method (GET|POST), param_key, param_to, param_message, param_sender,
 *   api_key, sender_id, extra (array of fixed params), success_contains (string in body)
 */
class SmsService
{
    public function mask(string $phone): string
    {
        $d = preg_replace('/\D+/', '', $phone);
        return strlen($d) < 7 ? '***' : substr($d, 0, 3).'XX-XXX'.substr($d, -3);
    }

    public function normalize(string $phone): string
    {
        $d = preg_replace('/\D+/', '', $phone);
        if (str_starts_with($d, '8801')) return $d;
        if (str_starts_with($d, '01')) return '88'.$d;
        return $d;
    }

    public function inQuietHours(): bool
    {
        $tz = config('modinalink.sms.timezone');
        $now = Carbon::now($tz);
        [$fh, $fm] = array_map('intval', explode(':', config('modinalink.sms.quiet_from')));
        [$th, $tm] = array_map('intval', explode(':', config('modinalink.sms.quiet_to')));
        $from = $now->copy()->setTime($fh, $fm);
        $to = $now->copy()->setTime($th, $tm);
        return $from > $to ? ($now >= $from || $now < $to) : ($now >= $from && $now < $to);
    }

    public function sendTemplate(User $user, string $key, array $vars = []): ?SmsLog
    {
        $tpl = SmsTemplate::where('key', $key)->where('is_active', true)->first();
        if (! $tpl || ! $user->phone) return null;
        if (! $tpl->transactional && (! $user->marketing_sms_optin || $this->inQuietHours())) return null;

        return $this->queue($user->phone, $tpl->render($user->locale ?: 'bn', $vars), $user->id, $key, $user->locale ?: 'bn');
    }

    public function queue(string $to, string $message, ?int $userId = null, ?string $templateKey = null, string $locale = 'bn'): SmsLog
    {
        $log = SmsLog::create([
            'user_id' => $userId, 'to_masked' => $this->mask($to),
            'template_key' => $templateKey, 'locale' => $locale, 'status' => 'queued',
        ]);
        SendSmsJob::dispatch($log->id, $this->normalize($to), $message);
        return $log;
    }

    /** Used by the job. Returns [ok, providerMessageId, error]. */
    public function deliver(string $to, string $message): array
    {
        $cfg = Setting::read('sms_provider');
        if (! $cfg || empty($cfg['url'])) {
            return [false, null, 'SMS provider is not configured'];
        }

        $params = array_merge($cfg['extra'] ?? [], [
            ($cfg['param_key'] ?? 'api_key') => $cfg['api_key'] ?? '',
            ($cfg['param_to'] ?? 'to') => $to,
            ($cfg['param_message'] ?? 'message') => $message,
        ]);
        if (! empty($cfg['sender_id'])) $params[$cfg['param_sender'] ?? 'sender_id'] = $cfg['sender_id'];

        $req = Http::timeout(15)->acceptJson();
        $res = strtoupper($cfg['method'] ?? 'POST') === 'GET'
            ? $req->get($cfg['url'], $params)
            : $req->asForm()->post($cfg['url'], $params);

        $body = $res->body();
        $needle = $cfg['success_contains'] ?? null;
        $ok = $res->successful() && ($needle === null || $needle === '' || str_contains($body, $needle));
        $msgId = $res->json('message_id') ?? $res->json('msg_id') ?? $res->json('id');

        return [$ok, $msgId ? (string) $msgId : null, $ok ? null : mb_substr('HTTP '.$res->status().' '.$body, 0, 200)];
    }
}
