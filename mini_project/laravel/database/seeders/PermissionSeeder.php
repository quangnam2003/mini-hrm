<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Module: employee
            ['module' => 'employee', 'action' => 'view',   'description' => 'Xem danh sách nhân viên'],
            ['module' => 'employee', 'action' => 'edit',   'description' => 'Thêm/Sửa nhân viên'],
            ['module' => 'employee', 'action' => 'toggle_status', 'description' => 'Bật/Vô hiệu hóa tài khoản nhân viên'],
            ['module' => 'employee', 'action' => 'export', 'description' => 'Xuất danh sách nhân viên'],

            // Module: permission
            ['module' => 'permission', 'action' => 'view',   'description' => 'Xem quyền của nhân viên'],
            ['module' => 'permission', 'action' => 'edit', 'description' => 'Gán / thu hồi quyền nhân viên'],

            // Module: leave_type
            ['module' => 'leave_type', 'action' => 'view',   'description' => 'Xem danh sách loại nghỉ phép'],
            ['module' => 'leave_type', 'action' => 'edit', 'description' => 'Quản lý (Thêm/Sửa/Xóa) loại nghỉ phép'],
            // Module: leave_request
            ['module' => 'leave_request', 'action' => 'view',     'description' => 'Xem danh sách đơn xin nghỉ của toàn bộ nhân viên'],
            ['module' => 'leave_request', 'action' => 'decide', 'description' => 'Duyệt / Từ chối đơn nghỉ phép của nhân viên'],
            // Module: leave_balance
            ['module' => 'leave_balance', 'action' => 'view',    'description' => 'Xem số dư ngày nghỉ phép của toàn bộ nhân viên'],
            ['module' => 'leave_balance', 'action' => 'edit',  'description' => 'Khởi tạo / điều chỉnh số dư ngày phép của nhân viên'],

            // Module: config
            ['module' => 'config', 'action' => 'view',    'description' => 'Xem danh sách cấu hình'],
            ['module' => 'config', 'action' => 'edit',  'description' => 'Thêm/Sửa/Xóa cấu hình'],

            // Module: attendance
            ['module' => 'attendance', 'action' => 'view',    'description' => 'Xem danh sách chấm công của toàn bộ nhân viên'],
            ['module' => 'attendance', 'action' => 'edit',  'description' => 'Chỉnh sửa giờ ra/vào của nhân viên'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['module' => $perm['module'], 'action' => $perm['action']],
                ['description' => $perm['description']]
            );
        }
    }
}
