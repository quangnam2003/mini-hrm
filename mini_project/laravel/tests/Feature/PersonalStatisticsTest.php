<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Attendance;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;

class PersonalStatisticsTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_can_get_personal_statistics()
    {
        [$user, $token] = $this->authenticate();

        // 1. Create Attendance for this month
        $now = Carbon::now();
        Attendance::factory()->create([
            'user_id' => $user->id,
            'work_date' => $now->toDateString(),
            'check_in' => $now->copy()->setTime(8, 0),
            'check_out' => $now->copy()->setTime(17, 0),
            'total_hours' => 8,
            'late_minutes' => 0,
            'early_leave_minutes' => 0,
            'ot_hours' => 1.5,
        ]);

        // 2. Create Leave Balance
        $leaveType = LeaveType::factory()->create(['name' => 'Annual Leave']);
        LeaveBalance::create([
            'user_id' => $user->id,
            'leave_type_id' => $leaveType->id,
            'year' => $now->year,
            'balance' => 12,
            'used_days' => 2,
            'pending_days' => 1,
        ]);

        // 3. Create Leave Request
        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'leave_type_id' => $leaveType->id,
            'status' => 'pending',
            'start_time' => $now->copy()->addDays(1),
            'end_time' => $now->copy()->addDays(1),
            'total_amount' => 1,
            'amount_unit' => 'days',
            'reason' => 'Test reason'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/v1/personal/statistics');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'attendance_summary' => [
                'total_hours', 'late_minutes', 'early_leave_minutes', 'ot_hours', 'days_present'
            ],
            'leave_summary' => [
                '*' => ['leave_type', 'balance', 'used_days', 'pending_days', 'remaining']
            ],
            'request_summary' => ['pending', 'approved'],
            'working_trend' => [
                '*' => ['month', 'label', 'total_hours', 'ot_hours']
            ]
        ]);

        $data = $response->json();
        $this->assertEquals(8, $data['attendance_summary']['total_hours']);
        $this->assertEquals(1.5, $data['attendance_summary']['ot_hours']);
        $this->assertEquals(1, $data['attendance_summary']['days_present']);
        
        $this->assertCount(1, $data['leave_summary']);
        $this->assertEquals(10, $data['leave_summary'][0]['remaining']);

        $this->assertEquals(1, $data['request_summary']['pending']);
        
        $this->assertCount(6, $data['working_trend']);
        // The last item should be current month
        $this->assertEquals(8, $data['working_trend'][5]['total_hours']);
    }
}
