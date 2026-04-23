<?php

namespace App\Interfaces;


interface PermissionRepositoryInterface
{
    public function index($request);

    public function getEmployeesByPermission($permissionId);
    public function userPermissions($id);

    public function getAllPermissionsToModule();
    public function assign($request, $id);
    public function revoke($id, $permissionId);

    public function BulkAssign($request);

    public function BulkRevoke($request);

    public function update($request, $id);
    public function assignUsersToPermissions($request);

    public function getPermissionByUser($userId);
}
