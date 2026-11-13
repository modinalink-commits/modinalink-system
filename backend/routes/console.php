<?php

use Illuminate\Support\Facades\Schedule;

// Renewal reminders at 30, 15, 7 and 1 days before renewal.
Schedule::command('modinalink:renewal-reminders')->dailyAt('09:00');
// Remove stale OTP and expired tokens.
Schedule::command('sanctum:prune-expired --hours=48')->daily();
