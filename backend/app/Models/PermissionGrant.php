<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionGrant extends Model
{
    public const SCOPES = ['content', 'settings'];
    protected $guarded = ['id'];
}
