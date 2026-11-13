<?php

namespace App\Jobs;

use App\Models\SmsLog;
use App\Services\SmsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendSmsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public function backoff(): array { return [60, 300]; }

    public function __construct(public int $logId, public string $to, public string $message) {}

    public function handle(SmsService $sms): void
    {
        $log = SmsLog::find($this->logId);
        if (! $log) return;
        $log->increment('attempts');

        [$ok, $msgId, $error] = $sms->deliver($this->to, $this->message);
        if ($ok) {
            $log->update(['status' => 'sent', 'provider_message_id' => $msgId, 'error' => null]);
            return;
        }
        $log->update(['status' => 'failed', 'error' => $error]);
        throw new \RuntimeException($error ?? 'SMS failed'); // triggers retry/backoff
    }
}
