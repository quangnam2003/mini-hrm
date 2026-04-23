<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Services\WorkSchedule\CalendarService;
use App\Models\WorkMonth;
use App\Http\Resources\ConfigRule\WorkMonthResource;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WorkMonthController extends Controller
{
    protected $calendarService;

    public function __construct(CalendarService $calendarService)
    {
        $this->calendarService = $calendarService;
    }

    public function index()
    {
        $months = WorkMonth::with('days')->latest('year')->latest('month')->get();
        return response()->json([
            'status' => 'success',
            'data' => WorkMonthResource::collection($months)
        ]);
    }

    public function show($id)
    {
        $month = WorkMonth::with('days')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => new WorkMonthResource($month)
        ]);
    }


    public function generate(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:m-Y',
        ]);

        try {
            $date = Carbon::createFromFormat('m-Y', $request->date);

            $workMonth = $this->calendarService->generateMonth(
                $date->year,
                $date->month
            );

            return response()->json([
                'status' => 'success',
                'message' => "Đã sinh lịch thành công cho tháng {$request->date}",
                'data' => new WorkMonthResource($workMonth)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function generateNextThreeMonths()
    {
        try {
            $results = $this->calendarService->autoGenerateNextThreeMonths();

            return response()->json([
                'status' => 'success',
                'message' => "Đã tự động sinh lịch cho 3 tháng tiếp theo.",
                'data' => WorkMonthResource::collection($results)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
