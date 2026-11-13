<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** One small controller for the business modules (quotes, orders, projects, milestones, products, licenses, automation, CMS). */
class ResourceController extends Controller
{
    private const R = [
        'quotes' => ['user_id' => 'nullable|integer|exists:users,id', 'lead_id' => 'nullable|integer|exists:leads,id', 'title' => 'required|string|max:190', 'amount_bdt' => 'nullable|integer|min:0', 'status' => 'nullable|in:draft,sent,accepted,declined', 'notes' => 'nullable|string|max:4000'],
        'orders' => ['user_id' => 'required|integer|exists:users,id', 'quote_id' => 'nullable|integer|exists:quotes,id', 'title' => 'required|string|max:190', 'amount_bdt' => 'nullable|integer|min:0', 'status' => 'nullable|in:new,in_progress,delivered,cancelled'],
        'projects' => ['user_id' => 'required|integer|exists:users,id', 'order_id' => 'nullable|integer|exists:orders,id', 'name' => 'required|string|max:190', 'status' => 'nullable|in:planning,in_progress,on_hold,completed', 'progress' => 'nullable|integer|min:0|max:100'],
        'milestones' => ['project_id' => 'required|integer|exists:projects,id', 'title' => 'required|string|max:190', 'status' => 'nullable|in:pending,in_progress,awaiting_client,completed', 'due_date' => 'nullable|date', 'sort' => 'nullable|integer|min:0'],
        'products' => ['name' => 'required|string|max:190', 'description' => 'nullable|string|max:4000', 'price_bdt' => 'nullable|integer|min:0', 'status' => 'nullable|in:active,coming_soon,retired'],
        'licenses' => ['user_id' => 'required|integer|exists:users,id', 'product_id' => 'required|integer|exists:products,id', 'license_key' => 'nullable|string|max:64', 'status' => 'nullable|in:active,expired,revoked', 'expires_on' => 'nullable|date'],
        'automation_runs' => ['name' => 'required|string|max:190', 'status' => 'nullable|in:success,failed,waiting_approval', 'log' => 'nullable|string|max:8000', 'ran_at' => 'nullable|date'],
        'cms_pages' => ['slug' => 'required|string|max:120|alpha_dash', 'title' => 'required|string|max:190', 'body' => 'nullable|string|max:100000', 'status' => 'nullable|in:draft,published'],
    ];

    private function rules(string $res): array
    {
        abort_unless(isset(self::R[$res]), 404);
        return self::R[$res];
    }

    public function index(string $res)
    {
        $this->rules($res);
        $q = DB::table($res);
        if (in_array($res, ['quotes', 'orders', 'projects', 'licenses'], true)) {
            $q->leftJoin('users', 'users.id', '=', "$res.user_id")->select("$res.*", 'users.name as user_name', 'users.company as user_company');
        }
        if ($res === 'licenses') $q->leftJoin('products', 'products.id', '=', 'licenses.product_id')->addSelect('products.name as product_name');
        if ($res === 'milestones') $q->leftJoin('projects', 'projects.id', '=', 'milestones.project_id')->select('milestones.*', 'projects.name as project_name');
        return $q->orderByDesc("$res.id")->limit(200)->get();
    }

    public function store(Request $r, string $res)
    {
        $d = $r->validate($this->rules($res));
        if ($res === 'licenses' && empty($d['license_key'])) $d['license_key'] = strtoupper(Str::random(4).'-'.Str::random(4).'-'.Str::random(4).'-'.Str::random(4));
        $now = now();
        $id = DB::table($res)->insertGetId(array_filter($d, fn ($v) => $v !== null) + ['created_at' => $now, 'updated_at' => $now]);
        AuditLog::record($r->user()->id, "$res.create", $res, $id);
        return DB::table($res)->find($id);
    }

    public function update(Request $r, string $res, int $id)
    {
        $rules = array_map(fn ($v) => str_replace('required|', 'sometimes|', $v), $this->rules($res));
        $d = $r->validate($rules);
        abort_unless(DB::table($res)->where('id', $id)->exists(), 404);
        $d['updated_at'] = now();
        DB::table($res)->where('id', $id)->update($d);
        AuditLog::record($r->user()->id, "$res.update", $res, $id, array_diff_key($d, ['updated_at' => 1, 'body' => 1]));
        return DB::table($res)->find($id);
    }

    /** Files: staff uploads a file for a customer (and optionally a project). */
    public function uploadFile(Request $r)
    {
        $d = $r->validate(['user_id' => 'required|integer|exists:users,id', 'project_id' => 'nullable|integer|exists:projects,id', 'file' => 'required|file|max:10240']);
        return FileStore::save($r, (int) $d['user_id'], $d['project_id'] ?? null, $r->file('file'));
    }

    public function files()
    {
        return DB::table('files')->leftJoin('users', 'users.id', '=', 'files.user_id')->select('files.id', 'files.name', 'files.size', 'files.project_id', 'files.created_at', 'users.name as user_name')->orderByDesc('files.id')->limit(200)->get();
    }
}
