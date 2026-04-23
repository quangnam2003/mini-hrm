<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EmployeesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $employees;

    public function __construct($employees)
    {
        $this->employees = $employees;
    }

    public function collection()
    {
        return $this->employees;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Mã nhân viên',
            'Họ tên',
            'Email',
            'Số điện thoại',
            'Địa chỉ',
            'Vai trò',
            'Trạng thái',
            'Người tạo',
            'Ngày tạo',
        ];
    }

    public function map($employee): array
    {
        return [
            $employee->id,
            $employee->empCode,
            $employee->name,
            $employee->email,
            $employee->phone,
            $employee->address,
            $employee->role,
            $employee->is_active ? 'Kích hoạt' : 'Vô hiệu hóa',
            $employee->creator ? $employee->creator->name : '',
            $employee->created_at->format('d/m/Y H:i'),
        ];
    }
}
