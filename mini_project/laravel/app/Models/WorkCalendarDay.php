<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkCalendarDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_month_id',
        'work_date',
        'day_type',
        'holiday_name',
        'note',
    ];

    protected $casts = [
        'work_date' => 'date',
    ];

    public function workMonth()
    {
        return $this->belongsTo(WorkMonth::class, 'work_month_id');
    }

    public function isWorkday()
    {
        return $this->day_type === 'workday';
    }
}
