<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ────────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'empCode'  => 'EMP-2026-0001',
                'name'     => 'Admin',
                'password' => Hash::make('123456'),
                'role'     => 'admin',
                'phone'    => '0900000001',
                'address'  => 'Hà Nội',
                'is_active' => true,
            ]
        );

        // ── Nhân viên mẫu ────────────────────────────────────────────────────
        $employees = [
            [
                'empCode'  => 'EMP-2026-0002',
                'name'     => 'Nguyễn Văn A',
                'email'    => 'tuonghue@gmail.com',
                'password' => Hash::make('123456'),
                'role'     => 'employee',
                'phone'    => '0900000002',
                'address'  => 'TP.HCM',
                'is_active' => true,
                'created_by' => $admin->id,
            ],
            [
                'empCode'  => 'EMP-2026-0003',
                'name'     => 'Trần Thị B',
                'email'    => 'ttb@gmail.com',
                'password' => Hash::make('123456'),
                'role'     => 'employee',
                'phone'    => '0900000003',
                'address'  => 'Đà Nẵng',
                'is_active' => true,
                'created_by' => $admin->id,
            ],
            [
                'empCode'  => 'EMP-2026-0004',
                'name'     => 'Lê Văn C',
                'email'    => 'lvc@gmail.com',
                'password' => Hash::make('123456'),
                'role'     => 'employee',
                'phone'    => '0900000004',
                'address'  => 'Cần Thơ',
                'is_active' => false,  // nhân viên đã nghỉ
                'created_by' => $admin->id,
            ],
        ];

        foreach ($employees as $emp) {
            User::firstOrCreate(['email' => $emp['email']], $emp);
        }
    }
}
