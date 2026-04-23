<?php

namespace App\Services\WorkSchedule;

use App\Models\WorkMonth;
use App\Models\WorkCalendarDay;
use App\Models\RuleWorkSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CalendarService
{
    public function generateMonth($year, $month)
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $currentMonth = Carbon::now()->startOfMonth();

        if ($startDate->lt($currentMonth)) {
            throw new \Exception("Không được phép sinh lịch cho tháng trong quá khứ ({$month}/{$year}).");
        }

        $endDate = $startDate->copy()->endOfMonth();

        $activeRule = RuleWorkSetting::where('is_active', true)
            ->where('apply_from', '<=', $startDate)
            ->where(function ($query) use ($startDate) {
                $query->where('apply_to', '>=', $startDate)
                    ->orWhereNull('apply_to');
            })
            ->latest()
            ->first() ?? RuleWorkSetting::where('is_active', true)->latest()->first();

        if (!$activeRule) {
            throw new \Exception("Chưa có cấu hình quy tắc làm việc nào phù hợp cho tháng {$month}/{$year}.");
        }

        return DB::transaction(function () use ($year, $month, $activeRule, $startDate, $endDate) {
            $workMonth = WorkMonth::firstOrCreate(
                ['year' => $year, 'month' => $month],
                ['total_workdays' => 0]
            );

            $setting = $activeRule->setting;
            $satConfig = $setting['saturday_config'] ?? null;

            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                $dayType = 'workday';

                if ($date->isSunday()) {
                    $dayType = 'weekend';
                } elseif ($date->isSaturday()) {
                    $dayType = $this->determineSaturdayType($date, $satConfig);
                }

                WorkCalendarDay::firstOrCreate(
                    [
                        'work_month_id' => $workMonth->id,
                        'work_date' => $date->format('Y-m-d'),
                    ],
                    [
                        'day_type' => $dayType,
                    ]
                );
            }

            $totalWorkdays = WorkCalendarDay::where('work_month_id', $workMonth->id)
                ->where('day_type', 'workday')
                ->count();

            $workMonth->update(['total_workdays' => $totalWorkdays]);

            return $workMonth->load('days');
        });
    }

    public function generateThreeMonths($year, $month)
    {
        $results = [];
        $startDate = Carbon::createFromDate($year, $month, 1);

        for ($i = 0; $i < 3; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $results[] = $this->generateMonth($date->year, $date->month);
        }

        return $results;
    }

    public function autoGenerateNextThreeMonths()
    {
        $latest = WorkMonth::orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();

        if ($latest) {
            $startDate = Carbon::createFromDate($latest->year, $latest->month, 1)->addMonth();
        } else {
            $startDate = Carbon::now()->startOfMonth();
        }

        return $this->generateThreeMonths($startDate->year, $startDate->month);
    }

    public function autoScheduleIfNeeded()
    {
        $latestDay = WorkCalendarDay::orderBy('work_date', 'desc')->first();

        $shouldGenerate = false;

        if (!$latestDay) {
            $shouldGenerate = true;
        } else {
            $lastDate = Carbon::parse($latestDay->work_date)->startOfDay();
            $today = Carbon::today();
            $daysRemaining = $today->diffInDays($lastDate, false);

            if ($daysRemaining < 10) {
                $shouldGenerate = true;
            }
        }

        if ($shouldGenerate) {
            return $this->autoGenerateNextThreeMonths();
        }

        return null;
    }


    protected function determineSaturdayType(Carbon $date, $config)
    {
        if (!$config) return 'weekend';

        $type = $config['type'] ?? 'none';

        switch ($type) {
            case 'none':
                return 'weekend';
            case 'all':
            case 'every_week':
                return 'workday';
            case 'bi_weekly':
                $refDate = Carbon::parse($config['reference_date'])->startOfDay();
                $targetDate = $date->copy()->startOfDay();

                $diffInDays = $refDate->diffInDays($targetDate);
                $diffInWeeks = (int) floor($diffInDays / 7);

                $isRefWork = ($config['reference_type'] ?? 'on') === 'on';

                if ($diffInWeeks % 2 === 0) {
                    return $isRefWork ? 'workday' : 'weekend';
                } else {
                    return $isRefWork ? 'weekend' : 'workday';
                }
            default:
                return 'workday';
        }
    }
}
