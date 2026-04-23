<?php

namespace App\Repositories\LeaveRequest;

use App\Interfaces\LeaveRequest\LeaveRequestRepositoryInterface;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\Attendance;
use App\Models\RuleWorkSetting;
use App\Models\WorkCalendarDay;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LeaveRequestRepository implements LeaveRequestRepositoryInterface
{
    public function getAll($request)
    {
        $query = LeaveRequest::with(['user:id,name,empCode,avatar', 'leaveType:id,name']);

        $query->when($request->status, fn($q, $v) => $q->where('status', $v));
        $query->when($request->name, function ($q, $v) {
            $q->whereHas('user', function ($q) use ($v) {
                $q->where('name', 'like', "%{$v}%")
                    ->orWhere('empCode', 'like', "%{$v}%");
            });
        });
        $query->when($request->start_date && $request->end_date, function ($q) use ($request) {
            $q->whereDate('start_time', '>=', $request->start_date)
                ->whereDate('end_time', '<=', $request->end_date);
        });

        return $query->latest()->paginate($request->get('per_page', 10));
    }

    public function findById($id)
    {
        return LeaveRequest::with(['user', 'leaveType'])->findOrFail($id);
    }

    public function getUserRequests($userId, $request)
    {
        $query = LeaveRequest::where('user_id', $userId)->with('leaveType');
        $query->when($request->status, fn($q, $v) => $q->where('status', $v));

        return $query->latest()->paginate($request->get('per_page', 10));
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $year = date('Y', strtotime($data['start_time']));
            $amountInDays = $data['amount_unit'] === 'hours' ? $data['total_amount'] / 8 : $data['total_amount'];

            $leaveType = LeaveType::findOrFail($data['leave_type_id']);

            // Kiểm tra trùng lặp thời gian với Đơn chờ duyệt hoặc đã Duyệt
            $overlapActive = LeaveRequest::where('user_id', $data['user_id'])
                ->whereIn('status', ['pending', 'approved'])
                ->where(function ($query) use ($data) {
                    $query->where('start_time', '<', $data['end_time'])
                        ->where('end_time', '>', $data['start_time']);
                })
                ->exists();

            if ($overlapActive) {
                throw new \Exception("Bạn đã có đơn nghỉ phép trùng thời gian.");
            }

            // Nếu là phép có lương, kiểm tra và giữ chỗ số dư phép
            if ($leaveType->is_paid) {
                $balance = LeaveBalance::where('user_id', $data['user_id'])
                    ->where('leave_type_id', $data['leave_type_id'])
                    ->where('year', $year)
                    ->lockForUpdate() // Lock để tránh race condition
                    ->first();

                if (!$balance) {
                    throw new \Exception("Nhân viên chưa được khởi tạo ngày phép cho năm " . $year);
                }

                $remaining = $balance->balance - $balance->used_days - $balance->pending_days;

                if ($remaining < $amountInDays) {
                    throw new \Exception("Số dư ngày phép không đủ (Còn lại: $remaining ngày)");
                }

                $balance->pending_days += $amountInDays;
                $balance->save();
            }

            $request = LeaveRequest::create($data);
            return $request;
        });
    }

    public function updateStatus($id, string $status, ?string $note = null, $adminId, bool $isBatch = false)
    {
        $logic = function () use ($id, $status, $note, $adminId) {
            $leaveRequest = LeaveRequest::findOrFail($id);

            $approver = User::findOrFail($adminId);
            $requester = User::findOrFail($leaveRequest->user_id);

            if ($requester->id === $approver->id) {
                throw new \Exception("Bạn không thể tự xử lý đơn nghỉ phép của chính mình.");
            }

            $isRequesterManager = $requester->hasPermission('leave_request', 'approve') || $requester->hasPermission('leave_request', 'manage');
            if ($isRequesterManager && !$approver->isAdmin()) {
                throw new \Exception("Đơn của nhóm Quản lý thì chỉ có Admin mới được quyền xét duyệt.");
            }

            if ($leaveRequest->status !== 'pending') {
                throw new \Exception("Đơn này đã được xử lý hoặc hủy bỏ trước đó.");
            }

            $leaveType = $leaveRequest->leaveType ?: LeaveType::findOrFail($leaveRequest->leave_type_id);
            $amountInDays = $leaveRequest->amount_unit === 'hours' ? $leaveRequest->total_amount / 8 : $leaveRequest->total_amount;
            $year = date('Y', strtotime($leaveRequest->start_time));

            if ($leaveType->is_paid) {
                $balance = LeaveBalance::where('user_id', $leaveRequest->user_id)
                    ->where('leave_type_id', $leaveRequest->leave_type_id)
                    ->where('year', $year)
                    ->lockForUpdate() // Lock để tránh race condition
                    ->first();

                if (!$balance) {
                    throw new \Exception("Không tìm thấy dữ liệu số dư ngày phép.");
                }

                if ($status === 'approved') {
                    $balance->decrement('pending_days', $amountInDays);
                    $balance->increment('used_days', $amountInDays);
                } elseif ($status === 'rejected') {
                    $balance->decrement('pending_days', $amountInDays);
                }
            }

            $leaveRequest->update([
                'status' => $status,
                'approver_note' => $note,
                'process_by' => $adminId,
                'process_at' => now(),
            ]);

            // Tự động cập nhật Attendance nếu duyệt đơn
            if ($status === 'approved') {
                $this->syncAttendanceAfterApproval($leaveRequest, $leaveType);
            }

            return $leaveRequest;
        };

        // Tránh lồng transaction nếu đang chạy trong batch
        return $isBatch ? $logic() : DB::transaction($logic);
    }

    private function syncAttendanceAfterApproval($leaveRequest, $leaveType)
    {
        $start = Carbon::parse($leaveRequest->start_time);
        $end = Carbon::parse($leaveRequest->end_time);
        $ruleWork = RuleWorkSetting::where('is_active', true)->first();

        if ($leaveRequest->request_scope === 'full_day') {
            $attendanceStatus = $leaveType->is_paid ? 'leave' : 'absent';
            $tempDate = $start->copy()->startOfDay();
            $tempEnd = $end->copy()->startOfDay();

            while ($tempDate->lte($tempEnd)) {
                if (!$ruleWork || $ruleWork->isWorkingDay($tempDate)) {
                    $workDateStr = $tempDate->format('Y-m-d');
                    $existing = Attendance::where('user_id', $leaveRequest->user_id)
                        ->where('work_date', $workDateStr)->first();

                    if ($existing && $existing->check_in) {
                        $prevNote = $existing->note ? $existing->note . ' | ' : '';
                        $existing->update([
                            'note' => $prevNote . 'Đơn nghỉ được duyệt sau: ' . ($leaveType->name ?? ''),
                        ]);
                    } else {
                        $calendarDay = WorkCalendarDay::where('work_date', $workDateStr)->first();
                        Attendance::updateOrCreate(
                            ['user_id' => $leaveRequest->user_id, 'work_date' => $workDateStr],
                            [
                                'status' => $attendanceStatus,
                                'note' => 'Nghỉ phép: ' . ($leaveType->name ?? ''),
                                'rule_id' => $ruleWork?->id,
                                'calendar_day_id' => $calendarDay?->id,
                            ]
                        );
                    }
                }
                $tempDate->addDay();
            }
        } elseif ($leaveRequest->request_scope === 'half_day' && $leaveType->is_paid) {
            $workDateStr = $start->format('Y-m-d');
            $existing = Attendance::where('user_id', $leaveRequest->user_id)
                ->where('work_date', $workDateStr)
                ->whereNotNull('check_in')
                ->first();

            if ($existing) {
                $conf = $ruleWork->setting['shifts']['office_hours'] ?? [];
                if ($leaveRequest->half_day_period === 'morning') {
                    $newStartStr = $conf['half_day_split'] ?? ($conf['break_end'] ?? '13:00');
                    $newStartTime = Carbon::createFromFormat('Y-m-d H:i', $workDateStr . ' ' . $newStartStr);
                    $checkIn = Carbon::parse($existing->check_in);

                    $newLateMinutes = $checkIn->greaterThan($newStartTime)
                        ? abs((int) $checkIn->diffInMinutes($newStartTime))
                        : 0;

                    $prevNote = $existing->note ? $existing->note . ' | ' : '';
                    $existing->update([
                        'late_minutes' => $newLateMinutes,
                        'status' => $newLateMinutes > 0 ? 'late' : 'on_time',
                        'note' => $prevNote . 'Đơn nghỉ sáng có lương được duyệt sau',
                    ]);
                } elseif ($leaveRequest->half_day_period === 'afternoon') {
                    $prevNote = $existing->note ? $existing->note . ' | ' : '';
                    $existing->update([
                        'note' => $prevNote . 'Đơn nghỉ chiều có lương được duyệt sau',
                    ]);
                }
            }
        }
    }

    public function cancel($id, $userId)
    {
        return DB::transaction(function () use ($id, $userId) {
            $leaveRequest = LeaveRequest::where('id', $id)->where('user_id', $userId)->lockForUpdate()->firstOrFail();

            $leaveType = LeaveType::findOrFail($leaveRequest->leave_type_id);

            // Cho phép hủy nếu đơn Đang chờ HOẶC đơn Đã duyệt nhưng chưa nghỉ (trong tương lai)
            if (!in_array($leaveRequest->status, ['pending', 'approved'])) {
                throw new \Exception("Chỉ có thể hủy đơn nghỉ đang ở trạng thái Chờ duyệt hoặc Đã duyệt.");
            }

            if (Carbon::parse($leaveRequest->start_time)->lt(now())) {
                throw new \Exception("Không thể hủy đơn nghỉ phép đã bắt đầu hoặc ở trong quá khứ.");
            }

            $amountInDays = $leaveRequest->amount_unit === 'hours' ? $leaveRequest->total_amount / 8 : $leaveRequest->total_amount;
            $year = date('Y', strtotime($leaveRequest->start_time));

            if ($leaveType->is_paid) {
                $balance = LeaveBalance::where('user_id', $leaveRequest->user_id)
                    ->where('leave_type_id', $leaveRequest->leave_type_id)
                    ->where('year', $year)
                    ->lockForUpdate()
                    ->first();

                if ($balance) {
                    if ($leaveRequest->status === 'pending') {
                        $balance->decrement('pending_days', $amountInDays);
                    } elseif ($leaveRequest->status === 'approved') {
                        // Nếu đã duyệt thì trả lại used_days
                        $balance->decrement('used_days', $amountInDays);

                        // Đồng thời xóa các bản ghi Attendance được tạo tự động khi duyệt (nếu chưa hoàn thành)
                        Attendance::where('user_id', $userId)
                            ->where('work_date', '>=', Carbon::parse($leaveRequest->start_time)->toDateString())
                            ->where('work_date', '<=', Carbon::parse($leaveRequest->end_time)->toDateString())
                            ->where('is_completed', false)
                            ->delete();
                    }
                }
            }

            $leaveRequest->update(['status' => 'cancelled']);

            return $leaveRequest;
        });
    }


    public function updateStatuses(array $ids, string $status, ?string $note = null, $adminId)
    {
        return DB::transaction(function () use ($ids, $status, $note, $adminId) {
            $results = [
                'success_ids' => [],
                'failed' => [] // Sẽ chứa [id => ..., reason => ...]
            ];

            $leaveRequests = LeaveRequest::whereIn('id', $ids)->get();

            foreach ($leaveRequests as $leave) {
                try {
                    // Gọi updateStatus với modeBatch = true để không tạo nested transaction
                    $this->updateStatus($leave->id, $status, $note, $adminId, true);
                    $results['success_ids'][] = $leave->id;
                } catch (\Exception $e) {
                    $results['failed'][] = [
                        'id' => $leave->id,
                        'reason' => $e->getMessage()
                    ];
                }
            }
            return $results;
        });
    }
}
