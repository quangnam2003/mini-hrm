<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Services\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{

    protected $service;
    public function __construct(AttendanceService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $filters = $request->all();
        $data = $this->service->getAll($filters);
        return AttendanceResource::collection($data);
    }

    public function my(Request $request)
    {
        $filters = $request->only(['month', 'date', 'status', 'per_page', 'calendar_day_id', 'rule_id', 'work_month_id']);
        $data = $this->service->myAttendances(auth('api')->id(), $filters);

        return AttendanceResource::collection($data);
    }

    public function checkIn(Request $request, AttendanceService $service)

    {
        try {
            $attendance = $service->checkIn(auth('api')->id());
            return response()->json(['message' => 'Check-in thành công', 'data' => new AttendanceResource($attendance)]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function checkOut(Request $request, AttendanceService $service)
    {
        try {
            $attendance = $service->checkOut(auth('api')->id());
            return response()->json(['message' => 'Check-out thành công', 'data' => new AttendanceResource($attendance)]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    public function update(UpdateAttendanceRequest $request, $id)
    {
        try {
            $attendance = $this->service->updateAttendance($id, $request->validated(), auth('api')->id());
            return response()->json([
                'message' => 'Cập nhật chấm công thành công',
                'data' => new AttendanceResource($attendance)
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
