<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModulePermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $moduleNames = [
            'employee'      => 'Quản lý nhân viên',
            'permission'    => 'Quản lý phân quyền',
            'leave_type'    => 'Quản lý loại nghỉ',
            'leave_request' => 'Quản lý đơn nghỉ',
            'leave_balance' => 'Quản lý ngày nghỉ',
            'attendance' => 'Quản lý chấm công',
        ];

        // $this->resource is one group of permissions
        $moduleKey = $this->resource->first()->module ?? 'unknown';

        return [
            'module'      => $moduleKey,
            'module_name' => $moduleNames[$moduleKey] ?? ucfirst($moduleKey),
            'permissions' => PermissionResource::collection($this->resource),
        ];
    }
}
