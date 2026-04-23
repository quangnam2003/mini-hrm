"use client";

import { Clock } from "lucide-react";
import { PageHeader } from "@/components/common/layout/page-header";
import { EmployeeActions } from "@/features/attendance/components/employee-actions";
import { MyAttendanceManage } from "@/features/attendance/components/my-attendance-manage";
import { MyAttendanceControls } from "@/features/attendance/components/my-attendance-controls";

export function PersonalAttendanceView() {
  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden animate-in fade-in duration-500">
      <PageHeader
        icon={Clock}
        title="Chấm công cá nhân"
        description="Theo dõi dữ liệu chấm công và thời gian làm việc của bạn hàng ngày"
        actions={<EmployeeActions />}
      />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <MyAttendanceControls />
      </div>

      <div className="flex-1 min-h-0 bg-surface rounded-2xl border border-line shadow-sm overflow-hidden flex flex-col">
        <MyAttendanceManage />
      </div>
    </div>
  );
}
