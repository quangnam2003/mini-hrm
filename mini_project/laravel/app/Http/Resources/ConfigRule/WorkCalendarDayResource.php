<?php

namespace App\Http\Resources\ConfigRule;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkCalendarDayResource extends JsonResource
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
            'work_date' => $this->work_date->format('Y-m-d'),
            'day_type' => $this->day_type,
            'holiday_name' => $this->holiday_name,
            'note' => $this->note,
        ];
    }
}
