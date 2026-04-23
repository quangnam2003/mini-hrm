<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Attendance;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;

class PersonalStatisticsController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $attendancesThisMonth = Attendance::where('user_id', $user->id)
            ->whereBetween('work_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->get();

        $workMonth = \App\Models\WorkMonth::where('year', $now->year)->where('month', $now->month)->first();
        $totalRequiredWorkdays = $workMonth->total_workdays ?? 22;
        $totalRequiredHours = $totalRequiredWorkdays * 8.0;

        $attendanceSummary = [
            'total_hours' => round($attendancesThisMonth->sum('total_hours'), 2),
            'total_required_hours' => (float)$totalRequiredHours,
            'late_minutes' => $attendancesThisMonth->sum('late_minutes'),
            'early_leave_minutes' => $attendancesThisMonth->sum('early_leave_minutes'),
            'ot_hours' => round($attendancesThisMonth->sum('ot_hours'), 2),
            'days_present' => $attendancesThisMonth->whereNotNull('check_in')->count(),
            'total_required_workdays' => (int)$totalRequiredWorkdays,
        ];

        // 2. Leave Balance Summary
        $leaveBalances = LeaveBalance::with('leaveType')
            ->where('user_id', $user->id)
            ->where('year', $now->year)
            ->get();

        $leaveSummary = $leaveBalances->map(function ($lb) {
            $balance = (float)$lb->balance;
            $used = (float)$lb->used_days;
            return [
                'leave_type' => $lb->leaveType->name ?? 'Unknown',
                'balance' => $balance,
                'used_days' => $used,
                'pending_days' => (float)$lb->pending_days,
                'remaining' => max(0, $balance - $used),
            ];
        });

        $leaveRequests = LeaveRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->get();

        $requestSummary = [
            'pending' => $leaveRequests->where('status', 'pending')->count(),
            'approved' => $leaveRequests->where('status', 'approved')->count(),
        ];

        $trendStart = $now->copy()->subMonths(5)->startOfMonth();

        $trendData = Attendance::where('user_id', $user->id)
            ->where('work_date', '>=', $trendStart->toDateString())
            ->where('work_date', '<=', $endOfMonth->toDateString())
            ->get();

        $workMonths = \App\Models\WorkMonth::where('year', '>=', $trendStart->year)
            ->where(function ($q) use ($trendStart, $now) {
                $q->whereBetween('month', [1, 12]);
            })->get();

        $workingTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $yearStr = $month->year;
            $monthVal = $month->month;
            $monthStr = $month->format('Y-m');

            $monthlyAttendances = $trendData->filter(function ($att) use ($monthStr) {
                return $att->work_date && Carbon::parse($att->work_date)->format('Y-m') === $monthStr;
            });

            $currentWorkMonth = $workMonths->where('year', $yearStr)->where('month', $monthVal)->first();
            $reqDays = $currentWorkMonth->total_workdays ?? 22;

            $workingTrend[] = [
                'month' => $monthStr,
                'label' => $month->format('M Y'),
                'total_hours' => round($monthlyAttendances->sum('total_hours'), 2),
                'total_required_hours' => $reqDays * 8.0,
                'ot_hours' => round($monthlyAttendances->sum('ot_hours'), 2),
                'days_present' => $monthlyAttendances->whereNotNull('check_in')->count(),
                'total_required_workdays' => (int)$reqDays,
            ];
        }

        return response()->json([
            'attendance_summary' => $attendanceSummary,
            'leave_summary' => $leaveSummary,
            'request_summary' => $requestSummary,
            'working_trend' => $workingTrend,
        ]);
    }
}
