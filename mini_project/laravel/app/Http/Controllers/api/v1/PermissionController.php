<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\ModulePermissionResource;
use App\Interfaces\PermissionRepositoryInterface;
use App\Services\PermissionService;
use Illuminate\Http\Request;

use \Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PermissionController extends Controller
{

    protected $permission, $permissionService;


    public function __construct(PermissionRepositoryInterface $permission, PermissionService $permissionService)
    {
        $this->permission = $permission;
        $this->permissionService = $permissionService;
    }


    public function index(Request $request)
    {
        $permissions = $this->permission->index($request);
        return response()->json($permissions);
    }

    public function getPermissionByUser()
    {
        $user_id = Auth::id();
        $permissions = $this->permissionService->getPermissionByUser($user_id);
        return PermissionResource::collection($permissions);
    }

    public function getEmployeesByPermission($id)
    {
        $employee = $this->permission->getEmployeesByPermission($id);
        return response()->json([
            'data' => new PermissionResource($employee)
        ]);
    }

    public function userPermissions($id)
    {
        $employee = $this->permission->userPermissions($id);

        if (!$employee) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }

        return response()->json([
            'employee'    => ['id' => $employee->id, 'name' => $employee->name],
            'permissions' => $employee->permissions,
        ]);
    }


    public function assign(Request $request, $id)
    {
        $request->validate([
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);
        $employee = $this->permission->assign($request, $id);

        if ($employee instanceof JsonResponse) {
            return $employee;
        }

        return response()->json([
            'message'     => 'Gán quyền thành công.',
            'permissions' => $employee->permissions()->get(),
        ]);
    }

    public function revoke($id, $permissionId)
    {
        $this->permission->revoke($id, $permissionId);

        return response()->json(['message' => 'Thu hồi quyền thành công.']);
    }

    public function BulkAssign(Request $request)
    {
        $request->validate([
            'user_ids'         => 'required|array',
            'user_ids.*'       => 'integer|exists:users,id',
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $users = $this->permission->BulkAssign($request);

        if ($users instanceof JsonResponse) {
            return $users;
        }

        return response()->json([
            'message' => 'Gán quyền thành công.',
            'users'   => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'permissions' => $user->permissions()->get()
                ];
            }),
        ]);
    }

    public function BulkRevoke(Request $request)
    {
        $request->validate([
            'user_ids'         => 'required|array',
            'user_ids.*'       => 'integer|exists:users,id',
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $users = $this->permission->BulkRevoke($request);

        if ($users instanceof JsonResponse) {
            return $users;
        }

        return response()->json([
            'message' => 'Thu hồi quyền thành công.',
            'users'   => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'permissions' => $user->permissions()->get()
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);
        $user = $this->permission->update($request, $id);
        if ($user instanceof JsonResponse) {
            return $user;
        }
        return response()->json([
            'message'     => 'Cập nhật quyền thành công.',
            'permissions' => $user->permissions()->get(),
        ]);
    }

    public function getAllPermissionsToModule()
    {
        $permissions = $this->permission->getAllPermissionsToModule();
        return ModulePermissionResource::collection($permissions);
    }

    public function assignUsersToPermissions(Request $request)
    {
        $request->validate([
            '*.permission_id' => 'required|integer|exists:permissions,id',
            '*.user_ids'       => 'array',
            '*.user_ids.*'     => 'integer|exists:users,id',
        ]);

        $permissions =  $this->permission->assignUsersToPermissions($request);

        return response()->json([
            'message' => 'Gán nhân viên vào quyền thành công.',
            'data' => PermissionResource::collection($permissions)
        ]);
    }
}
