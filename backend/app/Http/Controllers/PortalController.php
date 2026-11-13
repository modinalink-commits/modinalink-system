<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\FileStore;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Customer-side views of the business modules. Everything is scoped to the signed-in customer. */
class PortalController extends Controller
{
    public function orders(Request $r)
    {
        return DB::table('orders')->where('user_id', $r->user()->id)->orderByDesc('id')->get();
    }

    public function quotes(Request $r)
    {
        return DB::table('quotes')->where('user_id', $r->user()->id)->whereIn('status', ['sent', 'accepted', 'declined'])->orderByDesc('id')->get();
    }

    public function projects(Request $r)
    {
        $ps = DB::table('projects')->where('user_id', $r->user()->id)->orderByDesc('id')->get();
        $ms = DB::table('milestones')->whereIn('project_id', $ps->pluck('id'))->orderBy('sort')->orderBy('id')->get()->groupBy('project_id');
        return $ps->map(fn ($p) => (array) $p + ['milestones' => $ms->get($p->id, collect())->values()]);
    }

    public function licenses(Request $r)
    {
        return DB::table('licenses')->join('products', 'products.id', '=', 'licenses.product_id')->where('licenses.user_id', $r->user()->id)->select('licenses.*', 'products.name as product_name')->orderByDesc('licenses.id')->get();
    }

    private function milestone(Request $r, int $id)
    {
        $m = DB::table('milestones')->join('projects', 'projects.id', '=', 'milestones.project_id')->where('milestones.id', $id)->where('projects.user_id', $r->user()->id)->select('milestones.*')->first();
        abort_unless($m, 404);
        abort_unless($m->status === 'awaiting_client', 422, 'এই ধাপ এখন আপনার অনুমোদনের অপেক্ষায় নেই।');
        return $m;
    }

    public function approve(Request $r, int $id)
    {
        $m = $this->milestone($r, $id);
        DB::table('milestones')->where('id', $id)->update(['status' => 'completed', 'approved_at' => now(), 'approved_by' => $r->user()->id, 'updated_at' => now()]);
        AuditLog::record($r->user()->id, 'milestone.approve', 'milestone', $id);
        return response()->json(['ok' => true]);
    }

    public function requestChanges(Request $r, int $id)
    {
        $d = $r->validate(['note' => 'required|string|max:500']);
        $this->milestone($r, $id);
        DB::table('milestones')->where('id', $id)->update(['status' => 'in_progress', 'client_note' => $d['note'], 'updated_at' => now()]);
        AuditLog::record($r->user()->id, 'milestone.changes_requested', 'milestone', $id, ['note' => $d['note']]);
        return response()->json(['ok' => true]);
    }

    public function files(Request $r)
    {
        return DB::table('files')->where('user_id', $r->user()->id)->select('id', 'name', 'size', 'project_id', 'created_at')->orderByDesc('id')->get();
    }

    public function uploadFile(Request $r)
    {
        $d = $r->validate(['file' => 'required|file|max:10240']);
        return FileStore::save($r, $r->user()->id, null, $r->file('file'));
    }

    public function download(Request $r, int $id)
    {
        return FileStore::download($id, $r->user()->id);
    }
}
