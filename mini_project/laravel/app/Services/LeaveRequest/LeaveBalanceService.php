<?php

namespace App\Services\LeaveRequest;

use App\Interfaces\LeaveRequest\LeaveBalanceRepositoryInterface;

class LeaveBalanceService
{
    public function __construct(
        protected LeaveBalanceRepositoryInterface $leaveBalanceRepository
    ) {}

    public function getAll($request)
    {
        return $this->leaveBalanceRepository->getAll($request);
    }

    public function getMyBalance($userId, $year)
    {
        return $this->leaveBalanceRepository->getMyBalance($userId, $year);
    }

    public function bulkInit(array $userIds, $leaveTypeId, $year, bool $shouldReset = false)
    {
        return $this->leaveBalanceRepository->bulkInit($userIds, $leaveTypeId, $year, $shouldReset);
    }

    public function update($id, array $data)
    {
        return $this->leaveBalanceRepository->update($id, $data);
    }
}
