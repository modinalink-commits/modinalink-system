<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\Notifier;
use Illuminate\Console\Command;

class RenewalReminders extends Command
{
    protected $signature = 'modinalink:renewal-reminders';
    protected $description = 'Send renewal reminder SMS at the configured day offsets (once per offset).';

    public function handle(Notifier $notifier): int
    {
        $days = config('modinalink.reminder_days');
        $sent = 0;
        Subscription::with('user')->where('status', 'active')->get()->each(function (Subscription $s) use ($days, $notifier, &$sent) {
            $left = (int) now()->startOfDay()->diffInDays($s->renews_on->startOfDay(), false);
            if (! in_array($left, $days, true) || $s->last_reminder_days === $left) return;
            $notifier->renewalReminder($s, $s->user);
            $s->update(['last_reminder_days' => $left]);
            $sent++;
        });
        $this->info("Reminders queued: {$sent}");
        return self::SUCCESS;
    }
}
