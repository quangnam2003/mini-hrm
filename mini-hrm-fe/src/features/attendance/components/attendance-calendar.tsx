"use client"

import * as React from "react"
import { 
  format, 
  startOfMonth, 
  startOfWeek, 
  eachDayOfInterval, 
  isToday,
  addDays,
  parseISO,
  isSameMonth
} from "date-fns"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"

import { AttendanceDayData } from "../types/attendance"
import { WEEKDAYS, statusMap } from "../constants"

interface AttendanceCalendarProps {
  data: AttendanceDayData[];
  currentDate?: Date;
  onDateClick?: (day: AttendanceDayData) => void;
  renderCellFooter?: (day: AttendanceDayData) => React.ReactNode;
  className?: string;
}

export function AttendanceCalendar({
  data,
  currentDate,
  onDateClick,
  renderCellFooter,
  className
}: AttendanceCalendarProps) {
  const referenceDate = React.useMemo(() => {
    if (currentDate) return currentDate;
    if (data && data.length > 0) {
      return parseISO(data[0].work_date);
    }
    return new Date();
  }, [data, currentDate]);

  const monthStart = startOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  const days = React.useMemo(() => {
    // Render 6 hàng cố định (42 ngày) để chiều cao lịch không bị thay đổi giữa các tháng
    const dayInterval = eachDayOfInterval({
      start: gridStart,
      end: addDays(gridStart, 41) 
    });

    return dayInterval.map(date => {
      const isoString = format(date, "yyyy-MM-dd");
      const apiDay = data.find(d => d.work_date === isoString);
      
      return {
        date,
        isoString,
        isCurrentMonth: isSameMonth(date, monthStart),
        apiData: apiDay 
      };
    });
  }, [gridStart, monthStart, data]);

  return (
    <div className={cn(
      "w-full h-full bg-surface rounded-2xl shadow-xl shadow-black/5 overflow-hidden ring-1 ring-line/10 flex flex-col", 
      className
    )}>
      {/* ─── Body: Lưới ngày (Scrollable) ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div className="grid grid-cols-7 border-b border-line bg-[#2E66A5] sticky top-0 z-30">
          {WEEKDAYS.map((day, index) => (
            <div key={day} className="py-3 text-center border-r last:border-0 border-line/20">
              <Typography 
                variant="label-xs" 
                className={cn(
                  "uppercase font-extrabold tracking-widest text-white/90",
                  index >= 5 && "text-white/70" 
                )}
              >
                {day}
              </Typography>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
        {days.map(({ date, isoString, isCurrentMonth, apiData }, index) => {
          // Ưu tiên dữ liệu từ API, nếu không có mới dùng logic mặc định (T7, CN)
          const isWeekend = apiData ? apiData.day_type === 'weekend' : (index % 7 >= 5);
          const isUserToday = isToday(date);

          return (
            <div
              key={isoString}
              onClick={() => {
                if (isCurrentMonth) {
                  const dayPayload: AttendanceDayData = apiData ?? {
                    work_date: isoString,
                    day_type: index % 7 >= 5 ? "weekend" : "workday",
                  };
                  onDateClick?.(dayPayload);
                }
              }}
              className={cn(
                "min-h-[110px] p-2.5 flex flex-col relative transition-all duration-200 border-b border-r border-line",
                "last:border-r-0", 
                
                !isCurrentMonth && "bg-subtle/50 select-none pointer-events-none",
                
                isCurrentMonth && (
                  isWeekend 
                    ? "bg-holiday-pattern" // Màu họa tiết gạch gạch cho ngày nghỉ
                    : "bg-surface hover:bg-primary-tint/30" // Màu nền cho ngày làm việc
                ),
                
                isCurrentMonth && "cursor-pointer group hover:z-10",
                
                isUserToday && isCurrentMonth && "bg-primary-tint/20 z-10 shadow-[inset_0_0_0_1px_rgba(27,79,138,0.2)]"
              )}
            >
              <div className={cn("flex flex-col h-full flex-1", !isCurrentMonth && "opacity-30")}>
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex gap-2 items-center">
                    <div className={cn(
                      "size-7 flex items-center justify-center rounded-lg tabular-nums transition-all",
                      isUserToday && isCurrentMonth 
                        ? "bg-primary text-primary-fg shadow-lg shadow-primary/30 scale-105" 
                        : !isCurrentMonth 
                          ? "text-subtle-text" 
                          : "text-base bg-secondary/5"
                    )}>
                      <Typography variant="label" className="inherit">
                        {format(date, "d")}
                      </Typography>
                    </div>
                    
                    {isUserToday && isCurrentMonth && (
                      <Typography variant="tiny" className="text-primary font-bold uppercase tracking-tight leading-none">
                        Hôm nay
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="flex-1 mt-1">
                  {isCurrentMonth && apiData?.status && (
                    <div className="flex gap-1 flex-wrap">
                      {typeof apiData.status === "string" ? (() => {
                        const normalizedStatus = apiData.status.toLowerCase();
                        return (
                          <div className="flex items-center gap-1.5 px-0.5">
                            <div 
                              className={cn(
                                "size-1.5 rounded-full ring-1 ring-surface shadow-sm shrink-0",
                                normalizedStatus === 'on_time' ? 'bg-success' : 
                                normalizedStatus === 'absent' ? 'bg-danger' : 
                                normalizedStatus === 'leave' ? 'bg-purple-500' :
                                'bg-warning' // late, early_leave
                              )} 
                            />
                            <Typography variant="label-xs" className={cn(
                              "font-bold tracking-tight",
                              normalizedStatus === 'on_time' ? 'text-success' : 
                              normalizedStatus === 'absent' ? 'text-danger' : 
                              normalizedStatus === 'leave' ? 'text-purple-600' :
                              'text-warning'
                            )}>
                              {statusMap[normalizedStatus as keyof typeof statusMap]?.label || apiData.status}
                            </Typography>
                          </div>
                        );
                      })() : typeof apiData.status === 'object' ? (
                        (['on_time', 'late', 'absent'] as const).map(statusKey => {
                          const count = (apiData.status as Record<string, number>)?.[statusKey] || 0;
                          const colorClass = 
                            statusKey === 'on_time' ? 'bg-success' : 
                            statusKey === 'late' ? 'bg-warning' : 'bg-danger';
                          
                          return count > 0 && (
                            <div 
                              key={statusKey}
                              className={cn("size-1.5 rounded-full ring-1 ring-surface shadow-sm", colorClass)} 
                            />
                          );
                        })
                      ) : null}
                    </div>
                  )}
                </div>
                
                <div className="mt-auto pt-1.5 border-t border-line/10">
                  {isCurrentMonth && apiData && (
                    <div className="transition-all duration-200">
                      {renderCellFooter?.(apiData)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  )
}