<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }


    public function getJWTCustomClaims()
    {
        return [];
    }

    protected $fillable = [
        'empCode',
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'address',
        'phone',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    public function createdEmployees()
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withPivot('created_at', 'is_direct')
            ->orderByPivot('created_at', 'asc')
            ->withTimestamps();
    }

    public function hasPermission(string $module, string $action): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        if (in_array($module, ['permission', 'leave_type'])) {
            return false;
        }

        $query = $this->permissions()->where('module', $module);

        // Nếu kiểm tra quyền 'view', chỉ cần user có bất kỳ quyền nào trong module đó
        if ($action === 'view') {
            return $query->exists();
        }

        return $query->where('action', $action)->exists();
    }


    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
