<?php

namespace App\Services\LeaveRequest;

use App\Interfaces\LeaveRequest\LeaveTypeRepositoryInterface;

class LeaveTypeService
{
    protected $leaveTypeRepository;

    public function __construct(LeaveTypeRepositoryInterface $leaveTypeRepository)
    {
        $this->leaveTypeRepository = $leaveTypeRepository;
    }

    public function getAll()
    {
        return $this->leaveTypeRepository->getAll();
    }

    public function getById($id)
    {
        return $this->leaveTypeRepository->getById($id);
    }

    public function create($data)
    {
        return $this->leaveTypeRepository->create($data);
    }

    public function update($id, $data)
    {
        return $this->leaveTypeRepository->update($id, $data);
    }

    public function delete($id)
    {
        return $this->leaveTypeRepository->delete($id);
    }
}
