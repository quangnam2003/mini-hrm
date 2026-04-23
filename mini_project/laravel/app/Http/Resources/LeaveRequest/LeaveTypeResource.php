<?php

namespace App\Http\Resources\LeaveRequest;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_paid' => $this->is_paid,
            'default_days' => $this->default_days,
            'allow_half_day' => $this->allow_half_day,
            'allow_hourly' => $this->allow_hourly,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
