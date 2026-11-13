<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name','email','phone','password','role','locale','company','marketing_sms_optin'];
    protected $hidden = ['password','remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'phone_verified_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'marketing_sms_optin' => 'boolean',
        ];
    }

    public function isStaff(): bool { return in_array($this->role, ['staff', 'admin'], true); }
    public function isAdmin(): bool { return $this->role === 'admin'; }

    public function tickets(): HasMany { return $this->hasMany(Ticket::class); }
    public function invoices(): HasMany { return $this->hasMany(Invoice::class); }
    public function grants(): HasMany { return $this->hasMany(PermissionGrant::class); }
    public function subscriptions(): HasMany { return $this->hasMany(Subscription::class); }

    public function canSelfEdit(string $scope): bool
    {
        return $this->grants()->where('scope', $scope)->exists();
    }
}
