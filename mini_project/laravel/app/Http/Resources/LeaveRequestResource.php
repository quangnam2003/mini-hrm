<?php

namespace App\Http\Resources;

use App\Http\Resources\LeaveRequest\LeaveTypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'leave_type' => new LeaveTypeResource($this->whenLoaded('leaveType')),
            'request_scope' => $this->request_scope,
            'half_day_period' => $this->half_day_period,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'total_amount' => $this->total_amount,
            'amount_unit' => $this->amount_unit,
            'reason' => $this->reason,
            'status' => $this->status,
            'approver_note' => $this->approver_note,
        ];
    }
}
