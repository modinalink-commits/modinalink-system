<?php

namespace App\Http\Controllers\Admin;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** Files live on the server disk under storage/app/files/<user>/ (never under public/). */
class FileStore
{
    public static function save(Request $r, int $ownerId, ?int $projectId, UploadedFile $f): array
    {
        $dir = storage_path('app/files/'.$ownerId);
        if (! is_dir($dir)) mkdir($dir, 0775, true);
        $stored = Str::random(24);
        $name = mb_substr(preg_replace('/[^\p{L}\p{N}._ -]/u', '_', $f->getClientOriginalName()), 0, 150) ?: 'file';
        $size = $f->getSize(); $mime = $f->getClientMimeType();
        $f->move($dir, $stored);
        $id = DB::table('files')->insertGetId(['user_id' => $ownerId, 'project_id' => $projectId, 'uploaded_by' => $r->user()->id, 'name' => $name, 'path' => $ownerId.'/'.$stored, 'size' => $size, 'mime' => $mime, 'created_at' => now(), 'updated_at' => now()]);
        AuditLog::record($r->user()->id, 'file.upload', 'file', $id);
        return ['id' => $id, 'name' => $name, 'size' => $size];
    }

    public static function download(int $id, ?int $onlyUser)
    {
        $row = DB::table('files')->where('id', $id)->when($onlyUser, fn ($q, $u) => $q->where('user_id', $u))->first();
        abort_unless($row && is_file(storage_path('app/files/'.$row->path)), 404);
        return response()->download(storage_path('app/files/'.$row->path), $row->name);
    }
}
