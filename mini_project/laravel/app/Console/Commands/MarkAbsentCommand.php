<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Attendance;
use App\Models\WorkCalendarDay;
use App\Models\RuleWorkSetting;
use App\Models\LeaveRequest;
use Carbon\Carbon;

#[Signature('attendance:mark-absent {date?} {--force}')]

#[Description('Đánh dấu vắng mặt cho nhân viên không check-in và đơn xin nghỉ')]
class MarkAbsentCommand extends Command
{
    public function handle()
    {
        $dateArgument = $this->argument('date');
        $force = $this->option('force');
        $targetDate = $dateArgument ? Carbon::parse($dateArgument) : Carbon::today();
        $todayStr = $targetDate->toDateString();

        $rule = RuleWorkSetting::where('is_active', true)->first();
        if ($rule && !$rule->isWorkingDay($targetDate)) {
            $this->info("Ngày {$todayStr} là ngày nghỉ theo quy định, bỏ qua.");
            return;
        }

        if ($targetDate->isToday() && !$force) {
            $shifts = $rule->setting['shifts'] ?? [];
            $lastShift = collect($shifts)->sortByDesc('work_end')->first();
            $workEnd = $lastShift['work_end'] ?? '17:30';

            $workEndThreshold = Carbon::createFromFormat('H:i', $workEnd)->addMinutes(30);

            if (Carbon::now()->lt($workEndThreshold)) {
                $this->warn("Ngày chưa kết thúc (Giờ làm kết thúc lúc {$workEnd}). Vui lòng chạy lệnh này sau {$workEndThreshold->format('H:i')}.");
                $this->info("Dùng option --force nếu bạn chắc chắn muốn chạy ngay bây giờ.");
                return;
            }
        }

        $calendarDay = WorkCalendarDay::where('work_date', $todayStr)->first();

        $usersWithoutAttendance = User::whereNotIn('id', function ($query) use ($todayStr) {
            $query->select('user_id')
                ->from('attendances')
                ->where('work_date', $todayStr);
        })->get();

        $absentCount = 0;

        foreach ($usersWithoutAttendance as $user) {
            $hasLeave = LeaveRequest::where('user_id', $user->id)
                ->where('status', 'approved')
                ->whereDate('start_time', '<=', $todayStr)
                ->whereDate('end_time', '>=', $todayStr)
                ->exists();

            if (!$hasLeave) {
                Attendance::create([
                    'user_id' => $user->id,
                    'rule_id' => $rule?->id,
                    'calendar_day_id' => $calendarDay?->id,
                    'work_date' => $todayStr,
                    'status' => 'absent',
                    'note' => 'Vắng mặt không phép'
                ]);
                $absentCount++;
            }
        }

        $this->info("Đã đánh dấu vắng mặt cho {$absentCount} nhân sự.");
    }
}
