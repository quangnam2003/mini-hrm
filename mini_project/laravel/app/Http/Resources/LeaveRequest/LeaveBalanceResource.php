<?php

namespace App\Http\Resources\LeaveRequest;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveBalanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'empCode' => $this->user->empCode,
                ];
            }),
            'leave_type' => $this->leaveType ? [
                'id' => $this->leaveType->id,
                'name' => $this->leaveType->name,
                'allow_half_day' => $this->leaveType->allow_half_day,
                'allow_hourly' => $this->leaveType->allow_hourly,
            ] : null,
            'year' => $this->year,
            'balance' => $this->balance,
            'used_days' => $this->used_days,
            'pending_days' => $this->pending_days,
            'remaining_days' => $this->balance - $this->used_days - $this->pending_days,
        ];
    }
}
