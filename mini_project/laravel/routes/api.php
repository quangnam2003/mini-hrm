<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



use App\Http\Controllers\api\v1\AttendanceController;
use App\Http\Controllers\api\v1\AuthController;
use App\Http\Controllers\api\v1\EmployeeController;
use App\Http\Controllers\api\v1\LeaveRequest\LeaveBalanceController;
use App\Http\Controllers\api\v1\LeaveRequest\LeaveRequestController;
use App\Http\Controllers\api\v1\LeaveRequest\LeaveTypeController;
use App\Http\Controllers\api\v1\PermissionController;
use App\Http\Controllers\api\v1\PersonalStatisticsController;
use App\Http\Controllers\api\v1\RuleWorkSettingController;
use App\Http\Controllers\api\v1\WorkMonthController;

Route::group(['prefix' => 'v1'], function ($router) {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::group(['middleware' => 'auth:api'], function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('update-profile', [AuthController::class, 'updateProfile']);
        Route::put('change-password', [AuthController::class, 'changePassword']);

        Route::get('personal/statistics', [PersonalStatisticsController::class, 'index']);

        Route::controller(EmployeeController::class)->group(function () {
            Route::get('employees-export', 'exportExcel')->middleware('permission:employee,export');

            Route::prefix('employees')->group(function () {
                Route::get('not-in-permission', 'getUserNotInPermission')->middleware('permission:employee,view');
                Route::get('my', 'getProfile');
                Route::get('/', 'index')->middleware('permission:employee,view');
                Route::post('/', 'store')->middleware('permission:employee,edit');
                Route::get('{id}', 'show');
                Route::put('{id}', 'update')->middleware('permission:employee,edit');
                Route::delete('{id}', 'destroy')->middleware('permission:employee,edit');
                Route::patch('{id}/status', 'toggleStatus')->middleware('permission:employee,toggle_status');
                Route::post('{id}/reset-password', 'resetPassword')->middleware('permission:employee,edit');
                Route::post('toggle-bulk-status', 'toggleBulkStatus')->middleware('permission:employee,toggle_status');
            });
        });

        Route::controller(PermissionController::class)->group(function () {
            Route::prefix('permissions')->group(function () {
                Route::get('/my', 'getPermissionByUser');
                Route::get('/', 'index')->middleware('permission:permission,view');
                Route::post('bulk-assign', 'BulkAssign')->middleware('permission:permission,edit');
                Route::post('bulk-revoke', 'BulkRevoke')->middleware('permission:permission,edit');
                Route::get('employees/{permissionId}', 'getEmployeesByPermission')->middleware('permission:permission,view');
                Route::put('{id}', 'update')->middleware('permission:permission,edit');
                Route::get('all', 'getAllPermissionsToModule')->middleware('permission:permission,view');
                Route::post('assign-users', 'assignUsersToPermissions')->middleware('permission:permission,edit');
            });

            Route::prefix('employees/{id}/permissions')->group(function () {
                Route::get('/', 'userPermissions')->middleware('permission:permission,view');
                Route::post('/', 'assign')->middleware('permission:permission,edit');
                Route::delete('{permissionId}', 'revoke')->middleware('permission:permission,edit');
            });
        });

        Route::prefix('leave-type')->group(function () {
            Route::get('/', [LeaveTypeController::class, 'getAll'])->middleware('permission:leave_type,view');
            Route::post('/', [LeaveTypeController::class, 'create'])->middleware('permission:leave_type,edit');
            Route::get('/{id}', [LeaveTypeController::class, 'getById'])->middleware('permission:leave_type,view');
            Route::put('/{id}', [LeaveTypeController::class, 'update'])->middleware('permission:leave_type,edit');
            Route::delete('/{id}', [LeaveTypeController::class, 'delete'])->middleware('permission:leave_type,edit');
        });

        Route::prefix('leave-balance')->group(function () {
            Route::get('/my', [LeaveBalanceController::class, 'myBalance']);
            Route::get('/', [LeaveBalanceController::class, 'index'])->middleware('permission:leave_balance,view');
            Route::post('/init', [LeaveBalanceController::class, 'bulkInit'])->middleware('permission:leave_balance,edit');
            Route::put('/{id}', [LeaveBalanceController::class, 'update'])->middleware('permission:leave_balance,edit');
        });

        Route::prefix('leave-request')->group(function () {
            Route::get('/my', [LeaveRequestController::class, 'myRequests']);
            Route::get('/', [LeaveRequestController::class, 'index'])->middleware('permission:leave_request,view');
            Route::post('/', [LeaveRequestController::class, 'store']);
            Route::post('/update-statuses', [LeaveRequestController::class, 'updateStatuses'])->middleware('permission:leave_request,decide');
            Route::get('/{id}', [LeaveRequestController::class, 'show']);
            Route::post('/{id}/cancel', [LeaveRequestController::class, 'cancel']);
            Route::post('/{id}/approve', [LeaveRequestController::class, 'approve'])->middleware('permission:leave_request,decide');
            Route::post('/{id}/reject', [LeaveRequestController::class, 'reject'])->middleware('permission:leave_request,decide');
        });

        Route::prefix('rule-work-settings')->group(function () {
            Route::get('/', [RuleWorkSettingController::class, 'index'])->middleware('permission:config,view');
            Route::post('/', [RuleWorkSettingController::class, 'store'])->middleware('permission:config,edit');
            Route::put('/{id}', [RuleWorkSettingController::class, 'update'])->middleware('permission:config,edit');
            Route::delete('/{id}', [RuleWorkSettingController::class, 'destroy'])->middleware('permission:config,edit');
            Route::post('/{id}/set-active', [RuleWorkSettingController::class, 'setActive'])->middleware('permission:config,edit');
        });

        Route::prefix('work-months')->group(function () {
            Route::get('/', [WorkMonthController::class, 'index']);
            Route::get('/{id}', [WorkMonthController::class, 'show']);
            Route::post('/generate', [WorkMonthController::class, 'generate'])->middleware('permission:config,edit');
            Route::post('/generate-next-3', [WorkMonthController::class, 'generateNextThreeMonths'])->middleware('permission:config,edit');
        });

        Route::prefix('attendances')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->middleware('permission:attendances,view');
            Route::get('/my', [AttendanceController::class, 'my']);
            Route::post('check-in', [AttendanceController::class, 'checkIn']);
            Route::post('check-out', [AttendanceController::class, 'checkOut']);
            Route::put('/{id}', [AttendanceController::class, 'update'])->middleware('permission:attendances,edit');
        });
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:api');
