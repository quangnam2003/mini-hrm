<?php

namespace App\Services\LeaveRequest;

use App\Interfaces\LeaveRequest\LeaveRequestRepositoryInterface;
use App\Models\LeaveType;
use App\Models\RuleWorkSetting;
use App\Models\WorkCalendarDay;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class LeaveRequestService
{
    public function __construct(
        protected LeaveRequestRepositoryInterface $leaveRequestRepository
    ) {}

    public function getAll($request)
    {
        return $this->leaveRequestRepository->getAll($request);
    }

    public function getUserRequests($request)
    {
        return $this->leaveRequestRepository->getUserRequests(Auth::id(), $request);
    }

    public function createRequest(array $data)
    {
        $ruleWork = RuleWorkSetting::where('is_active', true)->first();
        $data['user_id'] = Auth::id();

        $data['status'] = 'pending';

        $start = Carbon::parse($data['start_time']);
        $end = isset($data['end_time']) ? Carbon::parse($data['end_time']) : $start->copy();

        $officeShift = $ruleWork?->setting['shifts']['office_hours'] ?? [
            'work_start' => '08:30:00',
            'work_end' => '17:30:00',
            'break_start' => '12:00:00',
            'break_end' => '13:00:00',
        ];

        // Validation: Chặn tạo đơn vào ngày nghỉ (Lễ, Tết, Cuối tuần)
        if (in_array($data['request_scope'], ['half_day', 'hourly'])) {
            if (!$this->isRealWorkingDay($start, $ruleWork)) {
                throw new \Exception("Ngày " . $start->format('d/m/Y') . " là ngày nghỉ theo lịch, không thể tạo đơn.");
            }
        }

        if ($data['request_scope'] === 'half_day') {
            $data['total_amount'] = 0.5;
            $data['amount_unit'] = 'days';

            $date = $start->format('Y-m-d');
            if ($data['half_day_period'] === 'morning') {
                $data['start_time'] = $date . ' ' . ltrim($officeShift['work_start']);
                $data['end_time'] = $date . ' ' . ltrim($officeShift['half_day_split'] ?? $officeShift['break_start']);
            } else {
                $data['start_time'] = $date . ' ' . ltrim($officeShift['half_day_split'] ?? $officeShift['break_end']);
                $data['end_time'] = $date . ' ' . ltrim($officeShift['work_end']);
            }
        } elseif ($data['request_scope'] === 'full_day') {
            $startDate = $start->copy()->startOfDay();
            $endDate = $end->copy()->startOfDay();

            $realStart = null;
            $realEnd = null;
            $tempDate = $startDate->copy();

            while ($tempDate->lte($endDate)) {
                if ($this->isRealWorkingDay($tempDate, $ruleWork)) {
                    if (!$realStart) $realStart = $tempDate->copy();
                    $realEnd = $tempDate->copy();
                }
                $tempDate->addDay();
            }

            if (!$realStart) {
                throw new \Exception("Khoảng thời gian bạn chọn không chứa ngày làm việc nào.");
            }

            $data['start_time'] = $realStart->format('Y-m-d') . ' ' . ltrim($officeShift['work_start']);
            $data['end_time'] = $realEnd->format('Y-m-d') . ' ' . ltrim($officeShift['work_end']);

            $days = 0;
            $temp = $realStart->copy();
            while ($temp->lte($realEnd)) {
                if ($this->isRealWorkingDay($temp, $ruleWork)) {
                    $days++;
                }
                $temp->addDay();
            }

            $data['total_amount'] = $days;
            $data['amount_unit'] = 'days';
        } elseif ($data['request_scope'] === 'hourly') {
            if (!$start->isSameDay($end)) {
                throw new \Exception("Nghỉ theo giờ chỉ áp dụng trong cùng một ngày.");
            }
            $hours = $start->diffInMinutes($end) / 60;
            $data['total_amount'] = round($hours, 2);
            $data['amount_unit'] = 'hours';
        }

        $leaveTypeId = $data['leave_type_id'] ?? null;
        if (!$leaveTypeId) {
            $defaultPaidType = LeaveType::where('is_paid', false)
                ->where('is_active', true)
                ->first();

            if (!$defaultPaidType) {
                throw new \Exception("Vui lòng chọn loại nghỉ hoặc cấu hình loại nghỉ có lương mặc định.");
            }
            $leaveTypeId = $defaultPaidType->id;
            $data['leave_type_id'] = $leaveTypeId;
        }

        $leaveType = LeaveType::findOrFail($leaveTypeId);

        if ($data['request_scope'] === 'half_day' && !$leaveType->allow_half_day) {
            throw new \Exception("Loại phép này không cho phép nghỉ nửa buổi.");
        }

        if ($data['request_scope'] === 'hourly' && !$leaveType->allow_hourly) {
            throw new \Exception("Loại phép này không cho phép nghỉ theo giờ.");
        }

        // if (Carbon::parse($data['start_time'])->lt(now())) {
        //     throw new \Exception("Thời gian bắt đầu nghỉ không được ở trong quá khứ.");
        // }

        return $this->leaveRequestRepository->create($data);
    }

    private function isRealWorkingDay(Carbon $date, $ruleWork)
    {
        // 1. Kiểm tra trong bảng lịch làm việc (đã sinh lịch) - Bao gồm cả ngày lễ
        $calendarDay = WorkCalendarDay::where('work_date', $date->format('Y-m-d'))->first();
        if ($calendarDay) {
            return $calendarDay->day_type === 'workday';
        }

        // 2. Nếu chưa sinh lịch, kiểm tra theo Rule cấu hình (Thứ 7 cách tuần, vv.)
        if ($ruleWork) {
            return $ruleWork->isWorkingDay($date);
        }

        // 3. Fallback mặc định: Nghỉ Chủ Nhật
        return !$date->isSunday();
    }

    public function approveRequest($id, $note = null)
    {
        return $this->leaveRequestRepository->updateStatus($id, 'approved', $note, Auth::id());
    }

    public function rejectRequest($id, $note = null)
    {
        return $this->leaveRequestRepository->updateStatus($id, 'rejected', $note, Auth::id());
    }

    public function cancelRequest($id)
    {
        return $this->leaveRequestRepository->cancel($id, Auth::id());
    }

    public function getById($id)
    {
        return $this->leaveRequestRepository->findById($id);
    }

    public function updateStatuses(array $ids, string $status, ?string $note = null)
    {
        return $this->leaveRequestRepository->updateStatuses($ids, $status, $note, Auth::id());
    }
}
