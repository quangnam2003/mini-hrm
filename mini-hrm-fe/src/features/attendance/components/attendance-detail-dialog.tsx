"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { AttendanceDayData } from "../types/attendance";
import { dayTypeMap, statusMap } from "@/features/attendance/constants";
import { formatFullDate, formatTime, formatDurationFromHours, formatDurationFromMinutes } from "@/utils/date-format";
import { LogIn, LogOut, Timer, Coffee, Info, Calendar, LucideIcon } from "lucide-react";

interface Props {
  day: AttendanceDayData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceDetailDialog({ day, open, onOpenChange }: Props) {
  if (!day) return null;

  const normalizedStatus = typeof day.status === "string" ? day.status.toLowerCase() : "";
  const status = normalizedStatus ? statusMap[normalizedStatus as keyof typeof statusMap] : null;
  const dayType = dayTypeMap[day.day_type] || dayTypeMap.workday;
  const isLate = (day.late_minutes ?? 0) > 0;
  const isEarly = (day.early_leave_minutes ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden rounded-[28px] border-none shadow-2xl bg-surface [&>button]:text-primary [&>button]:hover:bg-primary/10 [&>button]:transition-colors [&>button]:border-transparent [&>button]:ring-0">
        <div className="bg-primary-tint p-6 pb-8 text-primary relative">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <BadgeTag icon={Calendar} label={dayType.label} className="bg-white/60 backdrop-blur-md border-primary/10 text-primary shadow-sm" />
              {status && (
                <BadgeTag 
                  icon={status.icon} 
                  label={status.label} 
                  className={cn(
                    "shadow-sm",
                    normalizedStatus === "late" || normalizedStatus === "early_leave" || normalizedStatus === "late_early_leave"
                      ? "bg-warning-bg border-warning-bd text-warning"
                      : normalizedStatus === "absent"
                      ? "bg-danger-bg border-danger-bd text-danger"
                      : normalizedStatus === "leave"
                      ? "bg-purple-50 border-purple-200 text-purple-600"
                      : "bg-success-bg border-success-bd text-success"
                  )} 
                />
              )}
            </div>
            <div className="space-y-1">
              <DialogTitle asChild>
                <Typography variant="h3" className="text-primary tracking-tight leading-tight">
                  Chi tiết chấm công
                </Typography>
              </DialogTitle>
              <Typography variant="small" className="text-primary/70 font-medium capitalize">
                {formatFullDate(day.work_date)}
              </Typography>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-8 pt-6 space-y-5 bg-surface">
          <div className="grid grid-cols-2 gap-4">
            <TimeCard label="Giờ vào" value={formatTime(day.check_in)} icon={LogIn} iconClass="text-success" />
            <TimeCard label="Giờ ra" value={formatTime(day.check_out)} icon={LogOut} iconClass="text-primary" />
          </div>
          <div className="space-y-3">
             <Typography variant="label-sm" className="px-1 text-muted uppercase tracking-widest">Hiệu suất ngày</Typography>
             <div className="grid grid-cols-3 gap-3">
                <StatItem label="Tổng giờ" value={formatDurationFromHours(day.total_hours)} />
                <StatItem label="Đi muộn" value={isLate ? formatDurationFromMinutes(day.late_minutes) : "0 phút"} active={isLate} activeClass="bg-warning-bg border-warning-bd text-warning" />
                <StatItem label="Về sớm" value={isEarly ? formatDurationFromMinutes(day.early_leave_minutes) : "0 phút"} active={isEarly} activeClass="bg-danger-bg border-danger-bd text-danger" />
              </div>
          </div>

          {/* Note & OT */}
          {(parseFloat(day.ot_hours ?? "0") > 0 || day.holiday_name || day.note) && (
            <div className="space-y-3">
              {day.holiday_name && <InfoRow icon={Coffee} title="Ngày lễ" value={day.holiday_name} colorClass="bg-warning-bg border-warning-bd text-warning" />}
              {parseFloat(day.ot_hours ?? "0") > 0 && <InfoRow icon={Timer} title="Tăng ca (OT)" value={`${day.ot_hours} giờ`} colorClass="bg-primary-tint border-primary-border text-primary" />}
              {day.note && (
                <div className="p-4 bg-surface rounded-2xl border border-line-subtle shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2 text-muted">
                    <Info size={14} />
                    <Typography variant="label-xs" className="uppercase tracking-widest">Ghi chú</Typography>
                  </div>
                  <Typography variant="p" className="text-base italic leading-relaxed text-muted font-medium">
                    {day.note}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Internal Helper Components ---

/** Pill badge dùng trong header */
const BadgeTag = ({ icon: Icon, label, className }: { icon: LucideIcon, label: string, className?: string }) => (
  <div className={cn(
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase shadow-sm",
    className
  )}>
    <Icon size={11} strokeWidth={3} />
    <Typography variant="tiny" className="text-inherit font-bold">{label}</Typography>
  </div>
);

/** Card cho Giờ vào / Giờ ra */
const TimeCard = ({ label, value, icon: Icon, iconClass }: { label: string, value: string, icon: LucideIcon, iconClass: string }) => (
  <div className="bg-surface p-4 rounded-2xl border border-primary/5 shadow-sm space-y-2">
    <div className="flex items-center gap-2">
      <Icon size={15} strokeWidth={2.5} className={iconClass} />
      <Typography variant="tiny" className="font-bold uppercase tracking-widest text-muted">{label}</Typography>
    </div>
    <Typography variant="p" className="text-[20px] font-bold tracking-tight leading-none text-tx-base">{value}</Typography>
  </div>
);

/** Ô thống kê nhỏ (Tổng giờ, Đi muộn, Về sớm) */
const StatItem = ({ label, value, active, activeClass }: { label: string, value: string, active?: boolean, activeClass?: string }) => (
  <div className={cn(
    "p-3 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center gap-1.5 transition-colors h-[76px]",
    active ? activeClass : "bg-surface border-line-subtle"
  )}>
    <Typography variant="tiny" className={cn(
      "font-bold uppercase tracking-widest leading-none",
      active ? "opacity-90" : "text-muted"
    )}>{label}</Typography>
    <Typography variant="p" className={cn(
      "text-base font-bold leading-tight", 
      !active && "text-tx-base"
    )}>{value}</Typography>
  </div>
);

/** Dòng thông tin phụ (OT, Ngày lễ) */
const InfoRow = ({ icon: Icon, title, value, colorClass }: { icon: LucideIcon, title: string, value: string, colorClass: string }) => (
  <div className={cn("flex items-center gap-3 p-3.5 rounded-2xl border", colorClass)}>
    <Icon size={18} strokeWidth={2} className="shrink-0" />
    <div>
      <Typography variant="tiny" className="font-bold uppercase tracking-widest opacity-70 leading-none mb-0.5">{title}</Typography>
      <Typography variant="p" className="text-sm font-bold leading-tight">{value}</Typography>
    </div>
  </div>
);