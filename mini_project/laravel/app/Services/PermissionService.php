<?php

namespace App\Services;

use App\Interfaces\PermissionRepositoryInterface;

class PermissionService
{
    protected $permissionRepository;

    public function __construct(PermissionRepositoryInterface $permissionRepository)
    {
        $this->permissionRepository = $permissionRepository;
    }

    public function getAllPermissionsToModule()
    {
        return $this->permissionRepository->getAllPermissionsToModule();
    }

    public function getPermissionByUser($userId)
    {
        return $this->permissionRepository->getPermissionByUser($userId);
    }
}
