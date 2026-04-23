"use client";

import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/layout/page-header";
import { EmployeeActions } from "@/features/attendance/components/employee-actions";

export function PersonalLeaveView() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        icon={CalendarDays}
        title="Lịch sử xin nghỉ"
        description="Theo dõi trạng thái và lịch sử các yêu cầu nghỉ phép cá nhân"
        actions={<EmployeeActions />}
      />

      <div className="bg-surface rounded-2xl border border-line shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
        <CalendarDays size={48} className="text-muted/20 mb-4" />
        <p className="text-muted text-sm font-medium">Tính năng lịch sử xin nghỉ đang trong quá trình xây dựng</p>
      </div>
    </div>
  );
}
