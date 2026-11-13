<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Lead;
use App\Models\PermissionGrant;
use App\Models\PriceItem;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class ManageController extends Controller
{
    public function users(Request $r)
    {
        return User::when($r->role, fn ($q, $v) => $q->where('role', $v))->latest()->paginate(30, ['id', 'name', 'email', 'phone', 'role', 'company', 'created_at']);
    }

    /** Only an admin can change roles (route is admin-only). */
    public function setRole(Request $r, int $id)
    {
        $d = $r->validate(['role' => 'required|in:customer,staff,admin']);
        $u = User::findOrFail($id);
        abort_if($u->id === $r->user()->id, 422, 'You cannot change your own role.');
        $u->update(['role' => $d['role']]);
        AuditLog::record($r->user()->id, 'user.role', 'user', $u->id, ['role' => $d['role']]);
        return $u;
    }

    /** Self-service grants are limited to content and settings in v1. */
    public function grant(Request $r, int $id)
    {
        $d = $r->validate(['scope' => 'required|in:'.implode(',', PermissionGrant::SCOPES), 'on' => 'required|boolean']);
        $u = User::findOrFail($id);
        if ($d['on']) {
            PermissionGrant::firstOrCreate(['user_id' => $u->id, 'scope' => $d['scope']], ['granted_by' => $r->user()->id]);
        } else {
            PermissionGrant::where('user_id', $u->id)->where('scope', $d['scope'])->delete();
        }
        AuditLog::record($r->user()->id, 'grant.set', 'user', $u->id, $d);
        return $u->grants()->pluck('scope');
    }

    public function leads(Request $r)
    {
        return Lead::latest()->paginate(30);
    }

    public function updateLead(Request $r, int $id)
    {
        $d = $r->validate(['status' => 'required|in:new,contacted,won,lost']);
        $l = Lead::findOrFail($id);
        $l->update($d);
        return $l;
    }

    public function savePrice(Request $r, ?int $id = null)
    {
        $d = $r->validate([
            'group_bn' => 'required|string|max:120', 'group_en' => 'required|string|max:120',
            'name_bn' => 'required|string|max:150', 'name_en' => 'required|string|max:150',
            'billing' => 'required|in:yearly,monthly,one_time,project,hourly,per_unit',
            'min_bdt' => 'nullable|integer|min:0', 'max_bdt' => 'nullable|integer|min:0|gte:min_bdt',
            'basis' => 'required|in:market,estimate', 'is_active' => 'boolean', 'sort' => 'integer',
        ]);
        $item = $id ? tap(PriceItem::findOrFail($id))->update($d) : PriceItem::create($d);
        AuditLog::record($r->user()->id, 'price.save', 'price_item', $item->id);
        return $item;
    }

    public function audit(Request $r)
    {
        return AuditLog::latest('id')->paginate(50);
    }
}
