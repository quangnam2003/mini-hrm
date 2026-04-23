<?php

namespace App\Repositories\LeaveRequest;

use App\Interfaces\LeaveRequest\LeaveTypeRepositoryInterface;
use App\Models\LeaveType;

class LeaveTypeRepository implements LeaveTypeRepositoryInterface
{
    public function getAll()
    {
        return LeaveType::all();
    }

    public function getById($id)
    {
        return LeaveType::find($id);
    }

    public function create($data)
    {
        return LeaveType::create($data);
    }

    public function update($id, $data)
    {
        $leaveType = LeaveType::find($id);
        $leaveType->update($data);
        return $leaveType;
    }

    public function delete($id)
    {
        $leaveType = LeaveType::find($id);
        $leaveType->delete();
        return $leaveType;
    }
}
