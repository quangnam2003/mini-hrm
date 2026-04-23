<?php

namespace App\Interfaces\LeaveRequest;

interface LeaveBalanceRepositoryInterface
{
    public function getAll($request);
    public function getMyBalance($userId, $year);
    public function getByUser($userId, $year);
    public function initBalance($userId, $leaveTypeId, $year, bool $shouldReset = false);
    public function bulkInit(array $userIds, $leaveTypeId, $year, bool $shouldReset = false);
    public function update($id, array $data);
}
