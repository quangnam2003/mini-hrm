import { AlertCircle, Calendar, CalendarDays, CheckCircle2, Clock, Coffee } from "lucide-react";

export const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const ATTENDANCE_CONFIG = {
  DEFAULT_GENERATE_MONTHS: 3,
};


export const ATTENDANCE_STATUS_LABELS = {
  ON_TIME: "Đúng giờ",
  LATE: "Muộn",
  ABSENT: "Vắng không phép",
  LEAVE: "Nghỉ có phép",
  WEEKEND: "Ngày nghỉ",
};

export const statusMap = {
  on_time: { label: "Đúng giờ", variant: "success", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  late: { label: "Đi muộn", variant: "warning", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
  early_leave: { label: "Về sớm", variant: "warning", icon: Clock, color: "text-orange-600 bg-orange-50 border-orange-100" },
  late_early_leave: { label: "Đi muộn & Về sớm", variant: "warning", icon: Clock, color: "text-orange-600 bg-orange-50 border-orange-100" },
  leave: { label: "Nghỉ có phép", variant: "info", icon: Calendar, color: "text-purple-600 bg-purple-50 border-purple-100" },
  absent: { label: "Vắng mặt", variant: "destructive", icon: AlertCircle, color: "text-rose-600 bg-rose-50 border-rose-100" },
};

export const dayTypeMap = {
    workday: { label: "Ngày làm việc", icon: Calendar, color: "text-blue-600 bg-blue-50" },
    weekend: { label: "Cuối tuần", icon: Coffee, color: "text-slate-600 bg-slate-100" },
    holiday: { label: "Ngày lễ", icon: CalendarDays, color: "text-purple-600 bg-purple-50" },
};