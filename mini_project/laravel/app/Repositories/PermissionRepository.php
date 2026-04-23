<?php

namespace App\Repositories;

use App\Interfaces\PermissionRepositoryInterface;
use App\Models\Permission;
use App\Models\User;

class PermissionRepository implements PermissionRepositoryInterface
{
    public function index($request)
    {
        $permissions = Permission::query();

        // Ẩn các module quản trị khỏi danh sách chung
        $permissions->whereNotIn('module', ['permission', 'leave_type', 'config']);

        if ($request->module) {
            $permissions->where('module', $request->module);
        }
        $permissions = $permissions->get();
        return $permissions;
    }

    public function getEmployeesByPermission($permissionId)
    {
        $employee = Permission::with('users')->find($permissionId);
        return $employee;
    }

    public function userPermissions($id)
    {
        $user = User::with(['permissions' => function ($query) {
            $query->whereNotIn('module', ['permission', 'leave_type', 'config']);
        }])->find($id);

        return $user;
    }

    public function getPermissionByUser($userId)
    {
        $user = User::findOrFail($userId);

        if ($user->role === 'admin') {
            return Permission::all();
        }

        return $user->permissions()
            ->whereNotIn('module', ['permission', 'leave_type', 'config'])
            ->get();
    }

    public function assign($request, $id)
    {
        $employee = User::with('permissions')->find($id);

        if (!$employee) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }

        if ($employee->role === 'admin') {
            return response()->json(['message' => 'Admin đã có tất cả quyền, không cần gán thêm.'], 422);
        }

        $syncData = $this->ensureViewPermissions($request->permission_ids);

        foreach ($syncData as $permId => $pivotData) {
            if ($pivotData['is_direct'] === false) {
                $existing = $employee->permissions->firstWhere('id', $permId);
                if ($existing && $existing->pivot->is_direct) {
                    $syncData[$permId]['is_direct'] = true;
                }
            }
        }

        $employee->permissions()->syncWithoutDetaching($syncData);
        return $employee;
    }
    public function revoke($id, $permissionId)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        }

        $permission = Permission::find($permissionId);
        if (!$permission) {
            return response()->json(['message' => 'Quyền không tồn tại.'], 404);
        }

        $user->permissions()->detach($permissionId);

        $this->cleanupModuleViewPermission($user, $permission->module);

        return $user;
    }

    public function BulkAssign($request)
    {
        $userIds = $request->user_ids;
        $permissionIds = $request->permission_ids;

        if (empty($userIds)) {
            return response()->json(['message' => 'Không tìm thấy nhân viên!'], 404);
        }

        $users = User::with('permissions')->whereIn('id', $userIds)->where('role', '!=', 'admin')->get();

        if ($users->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy nhân viên hợp lệ hoặc danh sách rỗng.'], 404);
        }

        $syncData = $this->ensureViewPermissions($permissionIds);
        /** @var User $user */
        foreach ($users as $user) {
            $userSyncData = $syncData;
            foreach ($userSyncData as $permId => $pivotData) {
                if ($pivotData['is_direct'] === false) {
                    $existing = $user->permissions->firstWhere('id', $permId);
                    if ($existing && $existing->pivot->is_direct) {
                        $userSyncData[$permId]['is_direct'] = true;
                    }
                }
            }
            $user->permissions()->syncWithoutDetaching($userSyncData);
        }

        return $users;
    }

    public function BulkRevoke($request)
    {
        $userIds = $request->user_ids;
        $permissionIds  = $request->permission_ids;

        if (empty($userIds)) {
            return response()->json(['message' => 'Không tìm thấy nhân viên!'], 404);
        }

        $users = User::whereIn('id', $userIds)->where('role', '!=', 'admin')->get();

        if ($users->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy nhân viên hợp lệ hoặc danh sách rỗng.'], 404);
        }

        $modules = Permission::whereIn('id', $permissionIds)->pluck('module')->unique();

        /** @var User $user */
        foreach ($users as $user) {
            $user->permissions()->detach($permissionIds);
            foreach ($modules as $module) {
                $this->cleanupModuleViewPermission($user, $module);
            }
        }

        return $users;
    }

    public function update($request, $id)
    {
        $user = User::findOrFail($id);
        if (!$user) return response()->json(['message' => 'Không tìm thấy nhân viên.'], 404);
        $syncData = $this->ensureViewPermissions($request->permission_ids);
        $user->permissions()->sync($syncData);
        return $user;
    }

    public function getAllPermissionsToModule()
    {
        $permissions = Permission::whereNotIn('module', ['permission', 'leave_type', 'config'])
            ->with('users.creator')
            ->get();
        return $permissions->groupBy('module');
    }

    public function assignUsersToPermissions($request)
    {
        $data = $request->all();
        $permissionIdsToReturn = [];

        foreach ($data as $item) {
            $permission = Permission::find($item['permission_id']);

            // Không cho phép gán quyền thuộc module permission hoặc leave_type cho employee
            if ($permission && in_array($permission->module, ['permission', 'leave_type', 'config'])) {
                continue;
            }

            if ($permission) {
                // Tải user và các permissions cũ ra để check (có lợi cho view logic)
                $users = User::with('permissions')
                    ->whereIn('id', $item['user_ids'])
                    ->where('role', '!=', 'admin')
                    ->get();

                $userIds = $users->pluck('id')->toArray();

                // Bản thân permission này là gán explicit, is_direct = true
                $syncData = [];
                foreach ($users as $user) {
                    $isDirect = true;
                    // Nếu là quyền view, kiểm tra xem user hiện tại có đang là indirect không
                    if ($permission->action === 'view') {
                        $existing = $user->permissions->firstWhere('id', $permission->id);
                        if ($existing && !$existing->pivot->is_direct) {
                            $isDirect = false;
                        }
                    }
                    $syncData[$user->id] = ['is_direct' => $isDirect];
                }

                $changes = $permission->users()->sync($syncData);
                $permissionIdsToReturn[] = $permission->id;

                $viewPermission = Permission::where('module', $permission->module)
                    ->where('action', 'view')
                    ->first();

                if ($viewPermission) {
                    $permissionIdsToReturn[] = $viewPermission->id;

                    if ($permission->action !== 'view') {
                        // Cần gán gián tiếp quyền view cho các uses. Dùng vòng lặp trên user
                        foreach ($users as $user) {
                            $isDirect = false;
                            $existingView = $user->permissions->firstWhere('id', $viewPermission->id);
                            if ($existingView && $existingView->pivot->is_direct) {
                                $isDirect = true;
                            }
                            $viewPermission->users()->syncWithoutDetaching([$user->id => ['is_direct' => $isDirect]]);
                        }
                    }

                    $detachedUserIds = $changes['detached'];
                    if (!empty($detachedUserIds)) {
                        $detachedUsers = User::with('permissions')->whereIn('id', $detachedUserIds)->get();
                        foreach ($detachedUsers as $user) {
                            $this->cleanupModuleViewPermission($user, $permission->module);
                        }
                    }
                }
            }
        }

        return Permission::whereIn('id', $permissionIdsToReturn)->with('users')->get();
    }

    private function ensureViewPermissions($permissionIds)
    {
        if (empty($permissionIds)) {
            return [];
        }

        // Lọc bỏ các quyền thuộc module cấm đối với nhân viên (permission, leave_type)
        $validPermissionIds = Permission::whereIn('id', $permissionIds)
            ->whereNotIn('module', ['permission', 'leave_type', 'config'])
            ->pluck('id')
            ->toArray();

        if (empty($validPermissionIds)) {
            return [];
        }

        $modules = Permission::whereIn('id', $validPermissionIds)->pluck('module')->unique();
        $viewPermissionIds = Permission::whereIn('module', $modules)
            ->where('action', 'view')
            ->pluck('id')
            ->toArray();

        $syncData = [];
        foreach ($validPermissionIds as $id) {
            $syncData[$id] = ['is_direct' => true];
        }

        foreach ($viewPermissionIds as $id) {
            if (!isset($syncData[$id])) {
                $syncData[$id] = ['is_direct' => false];
            }
        }

        return $syncData;
    }

    private function cleanupModuleViewPermission($user, $module)
    {
        $viewPermission = Permission::where('module', $module)
            ->where('action', 'view')
            ->first();

        if (!$viewPermission) {
            return;
        }

        $userViewPermission = $user->permissions->firstWhere('id', $viewPermission->id);
        if (!$userViewPermission) {
            return;
        }

        if ($userViewPermission->pivot->is_direct) {
            return;
        }

        $hasOtherActions = $user->permissions()
            ->where('module', $module)
            ->where('action', '!=', 'view')
            ->exists();

        if (!$hasOtherActions) {
            $user->permissions()->detach($viewPermission->id);
        }
    }
}
