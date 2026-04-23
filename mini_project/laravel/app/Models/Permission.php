<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'module',
        'action',
        'description',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permissions')
            ->withPivot('created_at', 'is_direct')
            ->orderByPivot('created_at', 'asc')
            ->withTimestamps();
    }
}
