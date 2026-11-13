<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:190|unique:users,email',
            'phone' => ['nullable', 'regex:/^(\+?88)?01[3-9]\d{8}$/', 'unique:users,phone'],
            'password' => 'required|string|min:8|max:100',
            'locale' => 'nullable|in:bn,en',
            'company' => 'nullable|string|max:150',
        ]);
        // Role is never taken from the request: public sign-up is always a customer.
        $user = User::create($d + ['role' => 'customer']);
        return response()->json(['token' => $user->createToken('web')->plainTextToken, 'user' => $user], 201);
    }

    public function login(Request $r)
    {
        $d = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', $d['email'])->first();
        if (! $user || ! Hash::check($d['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Email or password is incorrect.']);
        }
        return response()->json(['token' => $user->createToken('web')->plainTextToken, 'user' => $user]);
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();
        return response()->noContent();
    }

    public function me(Request $r)
    {
        $u = $r->user();
        return ['user' => $u, 'grants' => $u->grants()->pluck('scope'), 'disclosure' => config('modinalink.disclosure')];
    }

    public function updateMe(Request $r)
    {
        $d = $r->validate([
            'name' => 'sometimes|string|max:120', 'locale' => 'sometimes|in:bn,en',
            'company' => 'nullable|string|max:150', 'marketing_sms_optin' => 'sometimes|boolean',
        ]);
        $r->user()->update($d);
        return $r->user()->fresh();
    }

    /** Send a 6-digit OTP to the logged-in user's phone to verify it. */
    public function sendOtp(Request $r, SmsService $sms)
    {
        $u = $r->user();
        if (! $u->phone) throw ValidationException::withMessages(['phone' => 'Add a phone number first.']);

        $sendKey = "otp_sends:{$u->id}";
        $sends = (int) Cache::get($sendKey, 0);
        if ($sends >= config('modinalink.otp.max_sends_per_hour')) {
            throw ValidationException::withMessages(['phone' => 'Too many codes requested. Try again later.']);
        }
        Cache::put($sendKey, $sends + 1, now()->addHour());

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp:{$u->id}", ['hash' => Hash::make($code), 'tries' => 0], now()->addMinutes(config('modinalink.otp.ttl_minutes')));

        $msg = $u->locale === 'en' ? "Your ModinaLink code is {$code}. Do not share it." : "আপনার ModinaLink কোড {$code}। কাউকে বলবেন না।";
        $sms->queue($u->phone, $msg, $u->id, 'otp', $u->locale ?: 'bn');
        return response()->json(['sent' => true]);
    }

    public function verifyOtp(Request $r)
    {
        $d = $r->validate(['code' => 'required|digits:6']);
        $u = $r->user();
        $key = "otp:{$u->id}";
        $rec = Cache::get($key);
        if (! $rec) throw ValidationException::withMessages(['code' => 'Code expired. Request a new one.']);
        if ($rec['tries'] >= config('modinalink.otp.max_attempts')) {
            Cache::forget($key);
            throw ValidationException::withMessages(['code' => 'Too many attempts. Request a new code.']);
        }
        if (! Hash::check($d['code'], $rec['hash'])) {
            $rec['tries']++;
            Cache::put($key, $rec, now()->addMinutes(config('modinalink.otp.ttl_minutes')));
            throw ValidationException::withMessages(['code' => 'Incorrect code.']);
        }
        Cache::forget($key);
        $u->forceFill(['phone_verified_at' => now()])->save();
        return response()->json(['verified' => true]);
    }
}
