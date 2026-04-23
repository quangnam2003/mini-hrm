<?php

namespace App\Repositories\LeaveRequest;

use App\Interfaces\LeaveRequest\LeaveBalanceRepositoryInterface;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\User;

class LeaveBalanceRepository implements LeaveBalanceRepositoryInterface
{
    public function getAll($request)
    {
        $query = LeaveBalance::with(['user:id,name,empCode', 'leaveType:id,name']);

        $query->when($request->user_id, fn($q, $v) => $q->where('user_id', $v));
        $query->when($request->year, fn($q, $v) => $q->where('year', $v));

        return $query->latest()->paginate($request->get('per_page', 10));
    }

    public function getMyBalance($userId, $year)
    {
        return LeaveBalance::with(['leaveType:id,name,default_days'])
            ->where('user_id', $userId)
            ->where('year', $year)
            ->get();
    }

    public function getByUser($userId, $year)
    {
        return LeaveBalance::where('user_id', $userId)->where('year', $year)->first();
    }

    public function initBalance($userId, $leaveTypeId, $year, bool $shouldReset = false)
    {
        $user = User::findOrFail($userId);
        $leaveType = LeaveType::find($leaveTypeId);
        $defaultDays = $leaveType ? $leaveType->default_days : 0;

        $finalBalance = $defaultDays;

        if ($user->created_at->format('Y') == $year) {
            $joinMonth = (int) $user->created_at->format('m');
            $workMonths = 13 - $joinMonth;
            $finalBalance = floor(($defaultDays / 12) * $workMonths);
        }

        $attributes = [
            'user_id' => $userId,
            'leave_type_id' => $leaveTypeId,
            'year' => $year,
        ];

        $values = [
            'balance' => $finalBalance,
            'used_days' => 0,
            'pending_days' => 0,
        ];

        if ($shouldReset) {
            return LeaveBalance::updateOrCreate($attributes, $values);
        }

        return LeaveBalance::firstOrCreate($attributes, $values);
    }

    public function bulkInit(array $userIds, $leaveTypeId, $year, bool $shouldReset = false)
    {
        // $leaveTypes = LeaveType::where('is_active', true)->get();
        $results = [];

        foreach ($userIds as $userId) {
            $results[] = $this->initBalance($userId, $leaveTypeId, $year, $shouldReset);
        }

        return $results;
    }

    public function update($id, array $data)
    {
        return LeaveBalance::where('id', $id)->update($data);
    }
}
