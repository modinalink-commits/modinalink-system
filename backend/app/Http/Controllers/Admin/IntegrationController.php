<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\GatewayConfig;
use App\Models\Setting;
use App\Models\SmsLog;
use App\Models\SmsTemplate;
use App\Services\SmsService;
use Illuminate\Http\Request;

/** Admin-only: SMS provider, SMS templates and payment gateway settings. Secrets are write-only. */
class IntegrationController extends Controller
{
    public function gateways()
    {
        return GatewayConfig::all()->map(fn ($g) => [
            'gateway' => $g->gateway, 'enabled' => $g->enabled, 'mode' => $g->mode, 'fee_percent' => $g->fee_percent,
            'configured_keys' => $g->credentialKeys(), // key names only, never values
        ]);
    }

    public function updateGateway(Request $r, string $gateway)
    {
        abort_unless(in_array($gateway, GatewayConfig::GATEWAYS, true), 404);
        $d = $r->validate([
            'enabled' => 'sometimes|boolean', 'mode' => 'sometimes|in:sandbox,live',
            'fee_percent' => 'nullable|numeric|min:0|max:20', 'credentials' => 'sometimes|array',
            'credentials.*' => 'nullable|string|max:500',
        ]);
        $g = GatewayConfig::firstOrCreate(['gateway' => $gateway]);
        if (isset($d['credentials'])) {
            // Merge: a blank value keeps the stored secret, so the UI never needs to read it back.
            $merged = $g->credentials ?? [];
            foreach ($d['credentials'] as $k => $v) { if ($v !== null && $v !== '') $merged[$k] = $v; }
            $g->credentials = $merged;
        }
        foreach (['enabled', 'mode', 'fee_percent'] as $f) { if (array_key_exists($f, $d)) $g->{$f} = $d[$f]; }
        $g->save();
        AuditLog::record($r->user()->id, 'gateway.update', 'gateway', $g->id, ['gateway' => $gateway, 'enabled' => $g->enabled, 'mode' => $g->mode]);
        return ['gateway' => $g->gateway, 'enabled' => $g->enabled, 'mode' => $g->mode, 'configured_keys' => $g->credentialKeys()];
    }

    public function smsProvider()
    {
        $c = Setting::read('sms_provider') ?? [];
        unset($c['api_key']);
        $c['has_api_key'] = ! empty(Setting::read('sms_provider')['api_key'] ?? null);
        return $c;
    }

    public function updateSmsProvider(Request $r)
    {
        $d = $r->validate([
            'url' => 'required|url|max:300', 'method' => 'required|in:GET,POST', 'api_key' => 'nullable|string|max:300',
            'sender_id' => 'nullable|string|max:20', 'param_key' => 'nullable|string|max:40', 'param_to' => 'nullable|string|max:40',
            'param_message' => 'nullable|string|max:40', 'param_sender' => 'nullable|string|max:40',
            'extra' => 'nullable|array', 'success_contains' => 'nullable|string|max:80',
        ]);
        $old = Setting::read('sms_provider') ?? [];
        if (empty($d['api_key'])) $d['api_key'] = $old['api_key'] ?? '';
        Setting::write('sms_provider', $d, true);
        AuditLog::record($r->user()->id, 'sms.provider.update', 'setting');
        return response()->json(['ok' => true]);
    }

    public function templates()
    {
        return SmsTemplate::orderBy('key')->get();
    }

    public function updateTemplate(Request $r, string $key)
    {
        $d = $r->validate(['body_bn' => 'sometimes|string|max:500', 'body_en' => 'sometimes|string|max:500', 'is_active' => 'sometimes|boolean']);
        $t = SmsTemplate::where('key', $key)->firstOrFail();
        $t->update($d);
        return $t;
    }

    public function testSms(Request $r, SmsService $sms)
    {
        $d = $r->validate(['to' => ['required', 'regex:/^(\+?88)?01[3-9]\d{8}$/'], 'message' => 'nullable|string|max:300']);
        $log = $sms->queue($d['to'], $d['message'] ?? 'ModinaLink test SMS', $r->user()->id, 'test');
        return response()->json(['queued' => true, 'log_id' => $log->id], 202);
    }

    public function smsLogs(Request $r)
    {
        return SmsLog::when($r->status, fn ($q, $s) => $q->where('status', $s))->latest()->paginate(50);
    }
}
