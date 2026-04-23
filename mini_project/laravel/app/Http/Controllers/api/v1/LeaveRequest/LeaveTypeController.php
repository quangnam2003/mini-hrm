<?php

namespace App\Http\Controllers\api\v1\LeaveRequest;


use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveRequest\StoreLeaveTypeRequest;
use App\Http\Requests\LeaveRequest\UpdateLeaveTypeRequest;
use App\Http\Resources\LeaveRequest\LeaveTypeResource;
use App\Services\LeaveRequest\LeaveTypeService;

class LeaveTypeController extends Controller
{
    protected $leaveTypeService;

    public function __construct(LeaveTypeService $leaveTypeService)
    {
        $this->leaveTypeService = $leaveTypeService;
    }

    public function getAll()
    {
        return LeaveTypeResource::collection($this->leaveTypeService->getAll());
    }

    public function getById($id)
    {
        return $this->leaveTypeService->getById($id);
    }

    public function create(StoreLeaveTypeRequest $request)
    {

        $leaveType = $this->leaveTypeService->create($request->all());

        return response()->json([
            'message'  => 'Tạo loại nghỉ phép thành công.',
            'leaveType' => new LeaveTypeResource($leaveType),
        ], 201);
    }

    public function update(UpdateLeaveTypeRequest $request, $id)
    {
        $leaveType = $this->leaveTypeService->update($id, $request->all());

        return response()->json([
            'message'  => 'Cập nhật loại nghỉ phép thành công.',
            'leaveType' => new LeaveTypeResource($leaveType),
        ], 201);
    }

    public function delete($id)
    {
        $leaveType = $this->leaveTypeService->delete($id);

        return response()->json([
            'message'  => 'Xóa loại nghỉ phép thành công.',
        ], 201);
    }
}
