<?php

namespace App\Interfaces\LeaveRequest;

interface LeaveRequestRepositoryInterface
{
    public function getAll($request);
    public function findById($id);
    public function create(array $data);
    public function updateStatus($id, string $status, ?string $note = null, $adminId);
    public function cancel($id, $userId);
    public function getUserRequests($userId, $request);
    public function updateStatuses(array $ids, string $status, ?string $note = null, $adminId);
}
