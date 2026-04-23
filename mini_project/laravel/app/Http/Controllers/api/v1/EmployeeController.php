<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Interfaces\EmployeeRepositoryInterface;
use App\Services\EmployeeService;
use App\Services\UploadService;
use Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;


class EmployeeController extends Controller
{

    protected $employeeRepository;
    protected $uploadService;
    protected $employeeService;

    public function __construct(
        EmployeeRepositoryInterface $employeeRepository,
        UploadService $uploadService,
        EmployeeService $employeeService
    ) {
        $this->employeeRepository = $employeeRepository;
        $this->uploadService = $uploadService;
        $this->employeeService = $employeeService;
    }

    public function getProfile()
    {
        $employee = $this->employeeService->getProfile(auth('api')->id());
        return new EmployeeResource($employee);
    }
    public function index(Request $request)
    {
        $employees = $this->employeeRepository->getAll($request);
        return EmployeeResource::collection($employees);
    }

    public function exportExcel(Request $request)
    {
        return $this->employeeService->exportExcel($request);
    }

    public function show($id)
    {
        $employee = $this->employeeRepository->findById($id);
        if ($employee instanceof JsonResponse) {
            return $employee;
        }
        return new EmployeeResource($employee);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $image = $this->uploadService->uploadFile($request->file('avatar'), 'avatars', 500, 500);
            $data['avatar'] = $image['path'];
        }
        $employee = $this->employeeRepository->create($data);
        if ($employee instanceof JsonResponse) {
            return $employee;
        }
        return response()->json([
            'message'  => 'Tạo nhân viên thành công.',
            'employee' => new EmployeeResource($employee),
        ], 201);
    }



    public function update(UpdateEmployeeRequest $request, $id)
    {
        $employee = $this->employeeRepository->findById($id);

        if ($employee instanceof JsonResponse) {
            return $employee;
        }

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($employee->avatar) {
                $this->uploadService->deleteFile($employee->avatar);
            }

            $image = $this->uploadService->uploadFile($request->file('avatar'), 'avatars', 500, 500);
            $data['avatar'] = $image['path'];
        }

        $update = $this->employeeRepository->update($id, $data);

        return response()->json([
            'message'  => 'Cập nhật thành công.',
            'employee' => new EmployeeResource($update->fresh('creator')),
        ]);
    }

    public function destroy($id)
    {
        $employee = $this->employeeRepository->delete($id);
        if ($employee instanceof JsonResponse) {
            return $employee;
        }
        return response()->json(['message' => 'Xóa nhân viên thành công.']);
    }

    public function toggleStatus($id)
    {
        $employee = $this->employeeRepository->toggleStatus($id);
        if ($employee instanceof JsonResponse) {
            return $employee;
        }

        $statusText = $employee->is_active ? 1 : 0;

        if ($statusText == 1) {
            $message = 'Tài khoản đã được kích hoạt.';
        } else {
            $message = 'Tài khoản đã được vô hiệu hóa.';
        }

        return response()->json([
            'message'   => $message,
            'is_active' => $employee->is_active,
        ]);
    }



    public function resetPassword(Request $request, $id)
    {
        $employee = $this->employeeRepository->resetPassword($request, $id);
        if ($employee instanceof JsonResponse) {
            return $employee;
        }
        return response()->json(['message' => 'Reset mật khẩu thành công.']);
    }

    public function getUserNotInPermission(Request $request)
    {
        $employee = $this->employeeRepository->getUserNotInPermission($request);
        if ($employee instanceof JsonResponse) {
            return $employee;
        }
        return response()->json([
            'message'  => 'Lấy danh sách nhân viên thành công.',
            'employee' => EmployeeResource::collection($employee),
        ], 201);
    }

    public function toggleBulkStatus(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        $employees = $this->employeeRepository->toggleBulkStatus($request->ids);

        if ($employees instanceof JsonResponse) {
            return $employees;
        }

        return response()->json([
            'message' => 'Thay đổi trạng thái hàng loạt thành công.',
            'count'   => $employees->count()
        ]);
    }
}
