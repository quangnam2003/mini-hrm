<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'leave_type_id',
        'request_scope',
        'half_day_period',
        'start_time',
        'end_time',
        'total_amount',
        'amount_unit',
        'reason',
        'status',
        'approver_note',
        'process_by',
        'process_at',
        'attachment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
}
