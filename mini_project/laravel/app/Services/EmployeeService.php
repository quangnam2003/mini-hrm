<?php

namespace App\Services;

use App\Interfaces\EmployeeRepositoryInterface;
use App\Exports\EmployeesExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class EmployeeService
{
    protected $employeeRepository;

    public function __construct(EmployeeRepositoryInterface $employeeRepository)
    {
        $this->employeeRepository = $employeeRepository;
    }

    public function getProfile($id)
    {
        return $this->employeeRepository->getProfile($id);
    }

    public function exportExcel(Request $request)
    {
        $employees = $this->employeeRepository->getAllForExport($request);
        return Excel::download(new EmployeesExport($employees), 'danh_sach_nhan_vien_' . date('Ymd_His') . '.xlsx');
    }

    public function toggleBulkStatus($ids)
    {
        return $this->employeeRepository->toggleBulkStatus($ids);
    }
}
