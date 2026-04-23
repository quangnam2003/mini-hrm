<?php

namespace App\Providers;

use App\Interfaces\EmployeeRepositoryInterface;
use App\Interfaces\LeaveRequest\LeaveBalanceRepositoryInterface;
use App\Interfaces\LeaveRequest\LeaveTypeRepositoryInterface;
use App\Interfaces\PermissionRepositoryInterface;
use App\Repositories\EmployeeRepository;
use App\Repositories\LeaveRequest\LeaveBalanceRepository;
use App\Repositories\LeaveRequest\LeaveTypeRepository;
use App\Repositories\PermissionRepository;
use App\Interfaces\LeaveRequest\LeaveRequestRepositoryInterface;
use App\Repositories\LeaveRequest\LeaveRequestRepository;
use App\Interfaces\WorkSchedule\RuleWorkSettingRepositoryInterface;
use App\Repositories\WorkSchedule\RuleWorkSettingRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(EmployeeRepositoryInterface::class, EmployeeRepository::class);
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepository::class);
        $this->app->bind(LeaveTypeRepositoryInterface::class, LeaveTypeRepository::class);
        $this->app->bind(LeaveBalanceRepositoryInterface::class, LeaveBalanceRepository::class);
        $this->app->bind(LeaveRequestRepositoryInterface::class, LeaveRequestRepository::class);
        $this->app->bind(RuleWorkSettingRepositoryInterface::class, RuleWorkSettingRepository::class);
    }


    public function boot(): void
    {
        //
    }
}
