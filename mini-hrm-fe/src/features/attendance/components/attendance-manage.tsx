"use client"

import * as React from "react"
import { AttendanceCalendar } from "./attendance-calendar"
import { Typography } from "@/components/ui/typography"
import { format } from "date-fns"

import { useAttendanceStore } from "@/features/attendance/stores/attendance"  
import { AttendanceEmptyState } from "./attendance-empty-state"
import { useGetAttendance } from "../hooks/use-get-attendance"
import { AttendanceDayData } from "../types/attendance"

export function AttendanceManage() {
  const { viewDate } = useAttendanceStore();
  const { data: attendanceData, isLoading } = useGetAttendance();
  
  const handleDateClick = (day: AttendanceDayData) => {
    // Logic cho sự kiện click ngày (nếu cần trong tương lai)
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Typography variant="label" className="text-tx-muted">Đang tải lịch chấm công...</Typography>
        </div>
      </div>
    );
  }

  const viewMonthStr = format(viewDate, "yyyy-MM");
  const hasDataForCurrentMonth = attendanceData?.some(d => d.work_date?.startsWith(viewMonthStr));

  if (!hasDataForCurrentMonth) {
    return <AttendanceEmptyState />;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-500">
      <AttendanceCalendar 
        data={attendanceData || []}
        currentDate={viewDate}
        className="h-full"
        onDateClick={handleDateClick}
        renderCellFooter={(day) => {
          if (!day?.total_employees || day.total_employees === 0) return null;
          
          return (
            <div className="flex items-center gap-1 select-none">
              <Typography variant="label-sm" className="text-primary/70">
                {day.total_employees}
              </Typography>
              <Typography variant="label-sm" className="text-tx-muted">
                nhân viên
              </Typography>
            </div>
          );
        }}
      />
    </div>
  );
}
