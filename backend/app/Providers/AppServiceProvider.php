<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(120)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('auth', fn (Request $r) => Limit::perMinute(10)->by($r->ip()));
        RateLimiter::for('otp', fn (Request $r) => Limit::perHour(10)->by($r->ip()));
        RateLimiter::for('public-form', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));
        RateLimiter::for('webhook', fn (Request $r) => Limit::perMinute(300)->by($r->ip()));
    }
}
