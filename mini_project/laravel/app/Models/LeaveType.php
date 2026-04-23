<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = [
        'name',
        'is_paid',
        'default_days',
        'allow_half_day',
        'allow_hourly',
        'is_active',
    ];

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }
}
