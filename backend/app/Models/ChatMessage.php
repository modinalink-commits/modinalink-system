<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    public $timestamps = false;
    protected $guarded = ['id'];
    protected $casts = ['from_staff' => 'boolean', 'created_at' => 'datetime'];
}
