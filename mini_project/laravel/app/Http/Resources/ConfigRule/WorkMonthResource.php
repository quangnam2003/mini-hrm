<?php

namespace App\Http\Resources\ConfigRule;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkMonthResource extends JsonResource
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
            'year' => $this->year,
            'month' => $this->month,
            'total_workdays' => $this->total_workdays,
            'note' => $this->note,
            'days' => WorkCalendarDayResource::collection($this->whenLoaded('days')),
        ];
    }
}
