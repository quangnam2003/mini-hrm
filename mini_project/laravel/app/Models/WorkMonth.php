<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkMonth extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'month',
        'total_workdays',
        'note',
    ];

    public function days()
    {
        return $this->hasMany(WorkCalendarDay::class, 'work_month_id');
    }
}
