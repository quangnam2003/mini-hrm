<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Services\WorkSchedule\RuleWorkSettingService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RuleWorkSettingController extends Controller
{
    protected $service;

    public function __construct(RuleWorkSettingService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $settings = $this->service->getAll();
        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string',
                'setting' => 'required|array',
                'is_active' => 'boolean',
                'apply_from' => 'nullable|date',
                'apply_to' => 'nullable|date',
            ], [
                'name.required' => 'Tên cấu hình không được để trống.',
                'setting.required' => 'Cấu hình làm việc không được để trống.',
                'apply_from.date' => 'Ngày bắt đầu không đúng định dạng.',
                'apply_to.date' => 'Ngày kết thúc không đúng định dạng.',
            ]);

            $setting = $this->service->store($data);
            return response()->json([
                'status' => 'success',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $data = $request->validate([
                'name' => 'string',
                'setting' => 'array',
                'is_active' => 'boolean',
                'apply_from' => 'nullable|date',
                'apply_to' => 'nullable|date',
            ], [
                'name.string' => 'Tên cấu hình phải là chuỗi ký tự.',
                'apply_from.date' => 'Ngày bắt đầu không đúng định dạng.',
                'apply_to.date' => 'Ngày kết thúc không đúng định dạng.',
            ]);

            $setting = $this->service->update($id, $data);
            return response()->json([
                'status' => 'success',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy($id)
    {
        $this->service->delete($id);
        return response()->json([
            'status' => 'success',
            'message' => 'Xóa cấu hình thành công'
        ]);
    }

    public function setActive($id)
    {
        try {
            $setting = $this->service->setActive($id);
            return response()->json([
                'status' => 'success',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
