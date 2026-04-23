<?php

namespace App\Http\Controllers\api\v1\LeaveRequest;

use App\Http\Controllers\Controller;
use App\Services\LeaveRequest\LeaveBalanceService;
use App\Http\Resources\LeaveRequest\LeaveBalanceResource;
use App\Models\LeaveBalance;
use Illuminate\Http\Request;

class LeaveBalanceController extends Controller
{
    public function __construct(
        private LeaveBalanceService $leaveBalanceService
    ) {}

    public function index(Request $request)
    {
        $balances = $this->leaveBalanceService->getAll($request);
        return LeaveBalanceResource::collection($balances);
    }

    public function myBalance(Request $request)
    {
        $request->validate([
            'year' => 'sometimes|integer|min:2020|max:2100',
        ]);

        $userId = auth('api')->id();
        $year   = $request->get('year', now()->year);

        $balances = $this->leaveBalanceService->getMyBalance($userId, $year);

        return LeaveBalanceResource::collection($balances);
    }

    public function bulkInit(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'year' => 'required|integer|min:2020',
            'should_reset' => 'sometimes|boolean',
        ]);

        $this->leaveBalanceService->bulkInit(
            $request->user_ids,
            $request->leave_type_id,
            $request->year,
            $request->get('should_reset', false)
        );

        return response()->json([
            'message' => 'Khởi tạo ngày phép hàng loạt thành công.'
        ]);
    }

    public function update($id, Request $request)
    {

        $balance_id = LeaveBalance::findOrFail($id);
        $validate = $request->validate([
            'leave_type_id' => 'sometimes|exists:leave_types,id',
            'year' => 'sometimes|integer|min:2020',
            'balance' => 'sometimes|integer',
            'used_days' => 'sometimes|integer',
            'pending_days' => 'sometimes|integer',
        ]);

        $this->leaveBalanceService->update($balance_id->id, $validate);

        return response()->json([
            'message' => 'Cập nhật ngày phép thành công.'
        ]);
    }
}
