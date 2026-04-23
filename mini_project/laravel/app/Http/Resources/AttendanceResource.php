<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\LeaveRequestResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'work_date'           => $this->work_date?->format('Y-m-d'),
            'check_in'            => $this->check_in?->format('Y-m-d H:i:s'),
            'check_out'           => $this->check_out?->format('Y-m-d H:i:s'),
            'total_hours'         => $this->total_hours,
            'late_minutes'        => $this->late_minutes,
            'early_leave_minutes' => $this->early_leave_minutes,
            'ot_hours'            => $this->ot_hours,
            'status'              => $this->status,
            'is_completed'        => $this->is_completed,
            'is_edited'           => $this->is_edited,
            'note'                => $this->note,
            'process_at'          => $this->process_at?->format('Y-m-d H:i:s'),
            'user'                => $this->whenLoaded('user', fn() => [
                'id'      => $this->user->id,
                'name'    => $this->user->name,
                'empCode' => $this->user->empCode,
            ]),
            'rule'                => $this->whenLoaded('rule', fn() => [
                'id'         => $this->rule->id,
                'name'       => $this->rule->name,
                'work_start' => $this->rule->setting['shifts']['office_hours']['work_start'],
                'work_end'   => $this->rule->setting['shifts']['office_hours']['work_end'],
            ]),
            'calendar_day'        => $this->whenLoaded('calendarDay', fn() => [
                'id'        => $this->calendarDay->id,
                'date'      => $this->calendarDay->work_date,
                'day_type'  => $this->calendarDay->day_type,
            ]),
            'leave_requests'      => LeaveRequestResource::collection($this->whenLoaded('leaveRequests')),
        ];
    }
}
