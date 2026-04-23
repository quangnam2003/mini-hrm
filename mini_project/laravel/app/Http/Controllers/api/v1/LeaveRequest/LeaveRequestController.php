<?php

namespace App\Http\Controllers\api\v1\LeaveRequest;

use App\Http\Controllers\Controller;
use App\Services\LeaveRequest\LeaveRequestService;
use Illuminate\Http\Request;
use Exception;

class LeaveRequestController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService
    ) {}

    public function index(Request $request)
    {
        $requests = $this->leaveRequestService->getAll($request);
        return response()->json($requests);
    }

    public function myRequests(Request $request)
    {
        $requests = $this->leaveRequestService->getUserRequests($request);
        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $validate = $request->validate([
            'leave_type_id' => 'nullable|exists:leave_types,id',
            'request_scope' => 'required|in:full_day,half_day,hourly',
            'half_day_period' => 'required_if:request_scope,half_day|in:morning,afternoon',
            'start_time' => 'required|date',
            'end_time' => 'required_unless:request_scope,half_day|date|after_or_equal:start_time',
            // 'total_amount' => 'required|numeric|min:0.5',
            'amount_unit' => 'required|in:days,hours',
            'reason' => 'required|string|max:500',
        ]);

        try {
            $leaveRequest = $this->leaveRequestService->createRequest($validate);
            return response()->json([
                'message' => 'Gửi đơn nghỉ phép thành công.',
                'data' => $leaveRequest
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show($id)
    {
        $leaveRequest = $this->leaveRequestService->getById($id);
        return response()->json($leaveRequest);
    }

    public function approve(Request $request, $id)
    {
        try {
            $leaveRequest = $this->leaveRequestService->approveRequest($id, $request->approver_note);
            return response()->json([
                'message' => 'Đã duyệt đơn nghỉ phép.',
                'data' => $leaveRequest
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            $leaveRequest = $this->leaveRequestService->rejectRequest($id, $request->approver_note);
            return response()->json([
                'message' => 'Đã từ chối đơn nghỉ phép.',
                'data' => $leaveRequest
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function cancel($id)
    {
        try {
            $leaveRequest = $this->leaveRequestService->cancelRequest($id);
            return response()->json([
                'message' => 'Đã hủy đơn nghỉ phép.',
                'data' => $leaveRequest
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function updateStatuses(Request $request)
    {
        $validate = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:leave_requests,id',
            'status' => 'required|in:approved,rejected',
            'approver_note' => 'nullable|string|max:500',
        ]);

        try {
            $leaveRequests = $this->leaveRequestService->updateStatuses($validate['ids'], $validate['status'], $validate['approver_note']);
            return response()->json([
                'message' => 'Đã cập nhật trạng thái đơn nghỉ phép.',
                'data' => $leaveRequests
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
