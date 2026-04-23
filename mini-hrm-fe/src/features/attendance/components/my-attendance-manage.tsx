"use client"

import * as React from "react"
import { AttendanceCalendar } from "./attendance-calendar"
import { Typography } from "@/components/ui/typography"
import { format } from "date-fns"

import { useAttendanceStore } from "@/features/attendance/stores/attendance"  
import { AttendanceEmptyState } from "./attendance-empty-state"
import { useGetMyAttendance } from "../hooks/use-get-my-attendance"
import { useGetAttendance } from "../hooks/use-get-attendance"
import { MyAttendanceRecord, AttendanceDayData } from "../types/attendance"
import { AttendanceDetailDialog } from "./attendance-detail-dialog"

export function MyAttendanceManage() {
  const { viewDate } = useAttendanceStore();
  const { data: attendanceHistory, isLoading: isLoadingMy } = useGetMyAttendance();
  const { data: monthData, isLoading: isLoadingMonth } = useGetAttendance();
  
  const [selectedDay, setSelectedDay] = React.useState<AttendanceDayData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const handleDateClick = (dayData: AttendanceDayData) => {
    setSelectedDay(dayData);
    setIsDetailOpen(true);
  };

  const isLoading = isLoadingMy || isLoadingMonth;

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
  
  // Kiểm tra tháng này đã được gen trên hệ thống chưa
  const hasDataForCurrentMonth = monthData?.some(d => d.work_date?.startsWith(viewMonthStr));

  if (!hasDataForCurrentMonth) {
    return <AttendanceEmptyState isAdmin={false} />;
  }

  const myData: MyAttendanceRecord[] = attendanceHistory?.data || [];

  // Chuyển đổi format: Giữ nguyên khung lịch của Admin (Lễ, Cuối tuần, Ngày thường)
  // và đè dữ liệu của cá nhân (check_in, check_out, status) lên trên.
  const calendarData: AttendanceDayData[] = monthData?.filter(d => d.work_date?.startsWith(viewMonthStr)).map(day => {
    const personalRecord = myData.find(my => my.work_date === day.work_date);
    
    return {
      ...day,
      ...(personalRecord ? {
        status: personalRecord.status,
        check_in: personalRecord.check_in,
        check_out: personalRecord.check_out,
        total_hours: personalRecord.total_hours,
        late_minutes: personalRecord.late_minutes,
        early_leave_minutes: personalRecord.early_leave_minutes,
        ot_hours: personalRecord.ot_hours,
        note: personalRecord.note,
      } : {
        status: undefined,
      }),
    };
  }) || [];

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-500">
      <AttendanceCalendar 
        data={calendarData}
        currentDate={viewDate}
        className="h-full"
        onDateClick={handleDateClick}
        renderCellFooter={(day) => {
          if (!day?.check_in && !day?.check_out) return null;
          
          const timeFormat = (timeStr?: string | null) => {
            if (!timeStr) return "--:--";
            return format(new Date(timeStr), "HH:mm");
          };

          return (
            <div className="flex flex-col gap-0.5 select-none pt-1">
              {day.check_in && (
                <div className="flex space-x-2 items-center px-0.5">
                  <Typography variant="label-xs" className="text-muted">Giờ vào</Typography>
                  <Typography variant="label-xs" className="text-primary">{timeFormat(day.check_in)}</Typography>
                </div>
              )}
              {day.check_out && (
                <div className="flex space-x-4 items-center px-0.5">
                  <Typography variant="label-xs" className="text-muted">Giờ ra</Typography>
                  <Typography variant="label-xs" className="text-primary">{timeFormat(day.check_out)}</Typography>
                </div>
              )}
            </div>
          );
        }}
      />

      <AttendanceDetailDialog
        day={selectedDay}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
