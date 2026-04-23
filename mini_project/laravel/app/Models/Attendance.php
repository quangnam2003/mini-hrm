<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'rule_id',
        'calendar_day_id',
        'work_date',
        'check_in',
        'check_out',
        'total_hours',
        'late_minutes',
        'early_leave_minutes',
        'ot_hours',
        'status',
        'is_completed',
        'is_edited',
        'process_by',
        'process_at',
        'note',
    ];

    protected $casts = [
        'work_date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'process_at' => 'datetime',
        'is_completed' => 'boolean',
        'is_edited' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rule()
    {
        return $this->belongsTo(RuleWorkSetting::class, 'rule_id');
    }

    public function calendarDay()
    {
        return $this->belongsTo(WorkCalendarDay::class, 'calendar_day_id');
    }
}
