<?php

namespace App\Services;

use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\WorkCalendarDay;
use App\Models\RuleWorkSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{

    public function getAll(array $filters = [])
    {
        $this->autoCheckoutAllPasts();

        $query = Attendance::with(['user', 'rule', 'calendarDay']);

        if (!empty($filters['month'])) {
            $query->whereRaw("DATE_FORMAT(work_date, '%Y-%m') = ?", [$filters['month']]);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('work_date', $filters['date']);
        }

        if (!empty($filters['from_date']) && !empty($filters['to_date'])) {
            $query->whereBetween('work_date', [$filters['from_date'], $filters['to_date']]);
        }
        $query->when($filters['calendar_day_id'] ?? null, function ($q, $v) {
            $q->where('calendar_day_id', $v);
        });


        if (!empty($filters['status'])) {
            if ($filters['status'] === 'auto_checkout') {
                $query->where('note', 'like', '%Hệ thống tự động check-out%');
            } else {
                $query->where('status', $filters['status']);
            }
        }

        if (isset($filters['is_edited'])) {
            $query->where('is_edited', (bool) $filters['is_edited']);
        }

        if (isset($filters['is_completed'])) {
            $query->where('is_completed', (bool) $filters['is_completed']);
        }

        if (!empty($filters['search'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('empCode', 'like', '%' . $filters['search'] . '%');
            });
        }

        $query->orderBy('work_date', 'desc');

        return $query->paginate($filters['per_page'] ?? 15);
    }

    private function autoCheckoutAllPasts()
    {
        $today = Carbon::today()->toDateString();
        $incompleted = Attendance::where('work_date', '<', $today)
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->where('is_completed', false)
            ->get();

        foreach ($incompleted as $attendance) {
            $this->processAutoCheckout($attendance);
        }
    }

    public function checkIn($userId)
    {
        return DB::transaction(function () use ($userId) {
            $today = Carbon::today()->toDateString();
            $now = Carbon::now();

            $calendarDay = WorkCalendarDay::where('work_date', $today)->first();
            $rule = RuleWorkSetting::where('is_active', true)->first() ?: RuleWorkSetting::first();

            $attendance = Attendance::lockForUpdate()->firstOrNew([
                'user_id' => $userId,
                'work_date' => $today
            ]);

            if ($attendance->check_in) {
                throw new \Exception("Bạn đã check-in ngày hôm nay rồi!");
            }

            $attendance->calendar_day_id = $calendarDay?->id;
            $attendance->rule_id = $rule?->id;

            $startTimeStr = $rule->setting['shifts']['office_hours']['work_start'] ?? '08:30';
            $startTime = Carbon::parse($today . ' ' . $startTimeStr);

            $leaves = LeaveRequest::with('leaveType')->where('user_id', $userId)
                ->where('status', 'approved')
                ->whereDate('start_time', '<=', $today)
                ->whereDate('end_time', '>=', $today)
                ->get();

            $isFullDayLeave = false;
            $lateMinutes = 0;

            foreach ($leaves as $leave) {
                $isPaid = $leave->leaveType->is_paid ?? false;
                if ($leave->request_scope === 'full_day') {
                    $isFullDayLeave = true;
                    // Nếu nghỉ cả ngày, không cần check các đơn khác nữa
                    break;
                } elseif ($leave->request_scope === 'half_day' && $leave->half_day_period === 'morning') {
                    $splitTime = $rule?->setting['shifts']['office_hours']['half_day_split'] ?? ($rule?->setting['shifts']['office_hours']['break_end'] ?? '13:00');
                    $newStart = Carbon::parse($today . ' ' . $splitTime);
                    if ($newStart->greaterThan($startTime)) {
                        $startTime = $newStart;
                    }
                    $attendance->note = ($attendance->note ? $attendance->note . ", " : "") . "Nghỉ phép buổi sáng (" . ($isPaid ? 'Có lương' : 'Không lương') . ")";
                } elseif ($leave->request_scope === 'hourly' && $isPaid) {
                    $leaveEnd = Carbon::parse($leave->end_time);
                    if ($leaveEnd->isSameDay($now) && $leaveEnd->greaterThan($startTime)) {
                        $newStart = $now->greaterThan($leaveEnd) ? $leaveEnd : $now->copy();
                        if ($newStart->greaterThan($startTime)) {
                            $startTime = $newStart;
                        }
                    }
                }
            }

            if (!$isFullDayLeave && $now->greaterThan($startTime)) {
                $lateMinutes = abs((int) $now->diffInMinutes($startTime));
            }

            $attendance->check_in = $now;
            $attendance->late_minutes = $lateMinutes;
            $attendance->status = ($isFullDayLeave) ? 'leave' : ($lateMinutes > 0 ? 'late' : 'on_time');

            $attendance->save();
            return $attendance->load(['user', 'rule', 'calendarDay']);
        });
    }


    public function myAttendances($userId, array $filters = [])
    {
        $this->autoCheckoutPasts($userId);

        $query = Attendance::with(['user', 'rule', 'calendarDay'])
            ->where('user_id', $userId)
            ->orderBy('work_date', 'desc');

        if (!empty($filters['month'])) {
            // format: Y-m  (vd: 2026-04)
            $query->whereRaw("DATE_FORMAT(work_date, '%Y-%m') = ?", [$filters['month']]);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('work_date', $filters['date']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['calendar_day_id'])) {
            $query->where('calendar_day_id', $filters['calendar_day_id']);
        }

        if (!empty($filters['work_month_id'])) {
            $query->whereHas('calendarDay', function ($q) use ($filters) {
                $q->where('work_month_id', $filters['work_month_id']);
            });
        }

        if (!empty($filters['rule_id'])) {
            $query->where('rule_id', $filters['rule_id']);
        }

        $perPage = $filters['per_page'] ?? 20;
        $paginator = $query->paginate($perPage);

        $dates = $paginator->pluck('work_date');
        if ($dates->isNotEmpty()) {
            $minDate = $dates->min();
            $maxDate = $dates->max();

            $leaveRequests = LeaveRequest::with('leaveType')
                ->where('user_id', $userId)
                ->where('status', 'approved')
                ->where(function ($q) use ($minDate, $maxDate) {
                    $q->whereDate('start_time', '<=', $maxDate)
                        ->whereDate('end_time', '>=', $minDate);
                })
                ->get();

            $paginator->getCollection()->each(function ($attendance) use ($leaveRequests) {
                $workDate = Carbon::parse($attendance->work_date);
                $dayLeaves = $leaveRequests->filter(function ($lr) use ($workDate) {
                    $start = Carbon::parse($lr->start_time)->startOfDay();
                    $end = Carbon::parse($lr->end_time)->endOfDay();
                    return $workDate->between($start, $end);
                });
                $attendance->setRelation('leaveRequests', $dayLeaves);
            });
        }

        return $paginator;
    }

    private function autoCheckoutPasts($userId)
    {
        $today = Carbon::today()->toDateString();
        /** @var \Illuminate\Database\Eloquent\Collection|Attendance[] $incompleted */
        $incompleted = Attendance::where('user_id', $userId)
            ->where('work_date', '<', $today)
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->where('is_completed', false)
            ->get();

        foreach ($incompleted as $attendance) {
            $this->processAutoCheckout($attendance);
        }
    }


    private function processAutoCheckout(Attendance $attendance)
    {
        DB::transaction(function () use ($attendance) {
            $rule = $attendance->rule ?: RuleWorkSetting::where('is_active', true)->first();
            if (!$rule) return;

            $workDate = $attendance->work_date;
            $conf = $rule->setting['shifts']['office_hours'] ?? [];

            $endTimeStr = $conf['work_end'] ?? '17:30';
            $breakStartStr = $conf['break_start'] ?? '12:00';
            $breakEndStr = $conf['break_end'] ?? '13:00';

            $leave = LeaveRequest::where('user_id', $attendance->user_id)
                ->where('status', 'approved')
                ->whereDate('start_time', '<=', $workDate)
                ->whereDate('end_time', '>=', $workDate)
                ->where('request_scope', 'half_day')
                ->where('half_day_period', 'afternoon')
                ->first();

            if ($leave) {
                $endTimeStr = $conf['half_day_split'] ?? $breakStartStr;
            }

            $checkIn = Carbon::parse($attendance->check_in);
            $workDateStr = Carbon::parse($workDate)->toDateString();
            $checkOut = Carbon::parse($workDateStr . ' ' . $endTimeStr);

            $totalMinutes = abs((int) $checkOut->diffInMinutes($checkIn));

            $lunchStart = Carbon::parse($workDateStr . ' ' . $breakStartStr);
            $lunchEnd = Carbon::parse($workDateStr . ' ' . $breakEndStr);

            if ($checkIn->lessThan($lunchStart) && $checkOut->greaterThan($lunchEnd)) {
                $lunchDuration = $lunchStart->diffInMinutes($lunchEnd);
                $totalMinutes -= $lunchDuration;
            }

            $attendance->update([
                'check_out' => $checkOut,
                'early_leave_minutes' => 0,
                'total_hours' => min(round($totalMinutes / 60, 2), 8.00),
                'ot_hours' => max(round(($totalMinutes / 60) - 8, 2), 0),
                'status' => $attendance->late_minutes > 0 ? 'late' : 'on_time',
                'is_completed' => true,
                'is_edited' => true,
                'note' => ($attendance->note ? $attendance->note . " | " : "") . "Hệ thống tự động check-out (quên checkout)"
            ]);
        });
    }

    public function checkOut($userId)
    {
        return DB::transaction(function () use ($userId) {
            $today = Carbon::today()->toDateString();
            $now = Carbon::now();

            $attendance = Attendance::where('user_id', $userId)
                ->where('work_date', $today)
                ->lockForUpdate()
                ->first();

            if (!$attendance || !$attendance->check_in) {
                throw new \Exception("Bạn chưa check-in ngày hôm nay!");
            }

            if ($attendance->check_out) {
                throw new \Exception("Bạn đã check-out ngày hôm nay rồi!");
            }

            $rule = $attendance->rule ?: RuleWorkSetting::where('is_active', true)->first();

            $leave = LeaveRequest::where('user_id', $userId)
                ->where('status', 'approved')
                ->whereDate('start_time', '<=', $today)
                ->whereDate('end_time', '>=', $today)
                ->first();

            $endTimeStr = '17:30';
            $breakStartStr = '12:00';
            $breakEndStr = '13:00';

            if ($rule && isset($rule->setting['shifts']['office_hours'])) {
                $conf = $rule->setting['shifts']['office_hours'];
                $endTimeStr = $conf['work_end'];
                $breakStartStr = $conf['break_start'];
                $breakEndStr = $conf['break_end'];
            }

            if ($leave && $leave->request_scope === 'half_day' && $leave->half_day_period === 'afternoon') {
                $endTimeStr = ($rule && isset($conf)) ? ($conf['half_day_split'] ?? $breakStartStr) : $breakStartStr;
                $attendance->note = ($attendance->note ? $attendance->note . ", " : "") . "Nghỉ phép buổi chiều";
            }

            $endTime = Carbon::parse($today . ' ' . $endTimeStr);

            $earlyMinutes = 0;
            if ($now->lessThan($endTime)) {
                $earlyMinutes = abs((int) $now->diffInMinutes($endTime));
            }

            $totalMinutes = abs((int) $now->diffInMinutes($attendance->check_in));

            $lunchStart = Carbon::parse($today . ' ' . $breakStartStr);
            $lunchEnd = Carbon::parse($today . ' ' . $breakEndStr);

            if ($attendance->check_in->lessThan($lunchStart) && $now->greaterThan($lunchEnd)) {
                $lunchDuration = $lunchStart->diffInMinutes($lunchEnd);
                $totalMinutes -= $lunchDuration;
            }

            $attendance->check_out = $now;
            $attendance->early_leave_minutes = $earlyMinutes;
            $attendance->total_hours = min(round($totalMinutes / 60, 2), 8.00);
            $attendance->ot_hours = max(round(($totalMinutes / 60) - 8, 2), 0);

            if ($earlyMinutes > 0) {
                if ($attendance->status === 'late') {
                    $attendance->status = 'late_early_leave';
                } elseif ($attendance->status === 'on_time') {
                    $attendance->status = 'early_leave';
                }
            }

            $attendance->is_completed = true;
            $attendance->save();
            return $attendance->load(['user', 'rule', 'calendarDay']);
        });
    }
    public function updateAttendance($id, array $data, $adminId)
    {
        return DB::transaction(function () use ($id, $data, $adminId) {
            $attendance = Attendance::findOrFail($id);
            $rule = $attendance->rule ?: RuleWorkSetting::where('is_active', true)->first() ?: RuleWorkSetting::first();

            if (isset($data['check_in'])) {
                $attendance->check_in = Carbon::parse($data['check_in']);
            }
            if (isset($data['check_out'])) {
                $attendance->check_out = Carbon::parse($data['check_out']);
            }

            if ($attendance->check_in) {
                $today = Carbon::parse($attendance->work_date)->toDateString();
                $conf = $rule->setting['shifts']['office_hours'] ?? [];

                $startTimeStr = $conf['work_start'] ?? '08:30';
                $endTimeStr = $conf['work_end'] ?? '17:30';
                $breakStartStr = $conf['break_start'] ?? '12:00';
                $breakEndStr = $conf['break_end'] ?? '13:00';

                $startTime = Carbon::parse($today . ' ' . $startTimeStr);
                $lateMinutes = 0;
                if ($attendance->check_in->greaterThan($startTime)) {
                    $lateMinutes = abs((int) $attendance->check_in->diffInMinutes($startTime));
                }
                $attendance->late_minutes = $lateMinutes;

                // Priority for status: late_early_leave > late > early_leave > on_time
                $status = 'on_time';
                if ($lateMinutes > 0 && ($attendance->early_leave_minutes ?? 0) > 0) {
                    $status = 'late_early_leave';
                } elseif ($lateMinutes > 0) {
                    $status = 'late';
                } elseif (($attendance->early_leave_minutes ?? 0) > 0) {
                    $status = 'early_leave';
                }

                if ($attendance->check_out) {
                    $endTime = Carbon::parse($today . ' ' . $endTimeStr);
                    $earlyMinutes = 0;
                    if ($attendance->check_out->lessThan($endTime)) {
                        $earlyMinutes = abs((int) $attendance->check_out->diffInMinutes($endTime));
                    }
                    $attendance->early_leave_minutes = $earlyMinutes;

                    if ($lateMinutes > 0 && $earlyMinutes > 0) {
                        $status = 'late_early_leave';
                    } elseif ($lateMinutes > 0) {
                        $status = 'late';
                    } elseif ($earlyMinutes > 0) {
                        $status = 'early_leave';
                    } else {
                        $status = 'on_time';
                    }

                    $totalMinutes = abs((int) $attendance->check_out->diffInMinutes($attendance->check_in));
                    $lunchStart = Carbon::parse($today . ' ' . $breakStartStr);
                    $lunchEnd = Carbon::parse($today . ' ' . $breakEndStr);

                    if ($attendance->check_in->lessThan($lunchStart) && $attendance->check_out->greaterThan($lunchEnd)) {
                        $lunchDuration = $lunchStart->diffInMinutes($lunchEnd);
                        $totalMinutes -= $lunchDuration;
                    }
                    $attendance->total_hours = min(round($totalMinutes / 60, 2), 8.00);
                    $attendance->ot_hours = max(round(($totalMinutes / 60) - 8, 2), 0);
                    $attendance->is_completed = true;
                }

                if ($attendance->status !== 'leave' && $attendance->status !== 'holiday') {
                    $attendance->status = $status;
                }
            }

            $attendance->is_edited = true;
            $attendance->process_by = $adminId;
            $attendance->process_at = Carbon::now();
            if (isset($data['note'])) {
                $attendance->note = $data['note'];
            }

            $attendance->save();
            return $attendance->load(['user', 'rule', 'calendarDay']);
        });
    }
}
