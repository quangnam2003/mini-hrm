<?php

namespace App\Interfaces;


interface EmployeeRepositoryInterface
{
    public function findById($id);
    public function getProfile($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function getAll($request);
    public function getAllForExport($request);
    public function toggleStatus($id);
    public function toggleBulkStatus($ids);
    public function resetPassword($request, $id);
    public function getUserNotInPermission($request);
}
