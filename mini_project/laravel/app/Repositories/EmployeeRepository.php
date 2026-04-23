<?php

namespace App\Repositories;

use App\Interfaces\EmployeeRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class EmployeeRepository implements EmployeeRepositoryInterface
{

    public function getAll($request)
    {
        return $this->buildQuery($request)
            ->latest()
            ->paginate(min($request->get('per_page', 10), 50));
    }

    public function getProfile($id)
    {
        return User::with(['creator', 'permissions', 'leaveBalances.leaveType'])->find($id);
    }

    public function getAllForExport($request)
    {
        return $this->buildQuery($request)
            ->latest()
            ->get();
    }

    private function buildQuery($request)
    {
        $query = User::query()
            ->select(['id', 'empCode', 'name', 'email', 'phone', 'address', 'avatar', 'role', 'is_active', 'created_by', 'created_at', 'updated_at'])
            ->with(['creator:id,name', 'leaveBalances.leaveType']);

        $query->when(
            $request->name,
            fn($q, $v) =>
            $q->where('name', 'like', "%{$v}%")
        );

        $query->when(
            $request->email,
            fn($q, $v) =>
            $q->where('email', 'like', "%{$v}%")
        );

        $query->when(
            $request->empCode,
            fn($q, $v) =>
            $q->where('empCode', 'like', "%{$v}%")
        );

        $query->when(
            $request->role,
            fn($q, $v) =>
            $q->where('role', $v)
        );

        $query->when(
            $request->has('is_active'),
            fn($q) =>
            $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN))
        );

        return $query;
    }

    public function findById($id)
    {
        $employee = User::with(['creator', 'permissions', 'leaveBalances.leaveType'])->find($id);

        if (!$employee) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }
        return $employee;
    }
    public function create(array $data)
    {
        $lastCode = User::where('empCode', 'like', 'EMP' . date('Y') . '%')
            ->orderByDesc('empCode')
            ->value('empCode');

        if ($lastCode) {
            $sequence = (int) substr($lastCode, -3) + 1;
        } else {
            $sequence = 1;
        }

        $data['empCode']     = 'EMP' . date('Y') . str_pad($sequence, 3, '0', STR_PAD_LEFT);
        $data['created_by']  = Auth::id();

        $data['role']        = $data['role'] ?? 'employee';

        $employee = User::create($data);

        return $employee;
    }
    public function update($id, array $data)
    {
        $employee = User::find($id);

        if (!$employee) {
            return null;
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $employee->update($data);
        return $employee;
    }
    public function delete($id)
    {
        $employee = User::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }

        if ($employee->id === Auth::id()) {
            return response()->json(['message' => 'Không thể tự xóa tài khoản của mình.'], 403);
        }

        if ($employee->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['message' => 'Không thể xóa admin duy nhất trong hệ thống.'], 403);
        }

        $employee->delete();
        return $employee;
    }


    public function toggleStatus($id)
    {
        $employee = User::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }

        if ($employee->id === Auth::id()) {
            return response()->json(['message' => 'Không thể thay đổi trạng thái của chính mình.'], 403);
        }

        $employee->update(['is_active' => !$employee->is_active]);


        return $employee;
    }

    public function toggleBulkStatus($ids)
    {
        $employees = User::whereIn('id', $ids)->get();
        if ($employees->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }
        if ($employees->contains('id', Auth::id())) {
            return response()->json(['message' => 'Không thể thay đổi trạng thái của chính mình.'], 403);
        }
        foreach ($employees as $employee) {
            $employee->update(['is_active' => !$employee->is_active]);
        }
        return $employees;
    }

    public function resetPassword($request, $id)
    {
        $request->validate([
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $employee = User::find($id);

        if (!$employee) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }

        $employee->update(['password' => Hash::make($request->password)]);
        return $employee;
    }

    public function getUserNotInPermission($request)
    {
        $query = User::query()
            ->select(['id', 'empCode', 'name', 'email', 'phone', 'address', 'avatar', 'role', 'is_active', 'created_by', 'created_at', 'updated_at'])
            ->with('creator:id,name')
            ->where('role', '!=', 'admin');

        $query->when($request->permission_ids, function ($q, $permissionIds) {
            $q->whereDoesntHave('permissions', function ($subQuery) use ($permissionIds) {
                $subQuery->whereIn('permissions.id', (array) $permissionIds);
            });
        });

        $query->when($request->name, fn($q, $v) => $q->where('name', 'like', "%{$v}%"));
        $query->when($request->email, fn($q, $v) => $q->where('email', 'like', "%{$v}%"));
        $query->when($request->empCode, fn($q, $v) => $q->where('empCode', 'like', "%{$v}%"));

        $query->when($request->role, fn($q, $v) => $q->where('role', $v));

        $query->when(
            $request->has('is_active'),
            fn($q) => $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN))
        );

        return $query
            ->latest()
            ->paginate(min($request->get('per_page', 10), 50));
    }
}
