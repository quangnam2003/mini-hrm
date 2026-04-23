<?php

namespace App\Http\Resources;

use App\Http\Resources\LeaveRequest\LeaveBalanceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'empCode'    => $this->empCode,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'address'    => $this->address,
            'role'       => $this->role,
            'is_active'  => $this->is_active,
            'avatar_url' => $this->avatar
                ? asset('storage/' . $this->avatar)
                : null,
            'leave_balances' => LeaveBalanceResource::collection($this->whenLoaded('leaveBalances')),
            'created_by' => $this->creator ? [
                'id'   => $this->creator->id,
                'name' => $this->creator->name,
            ] : null,
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}
