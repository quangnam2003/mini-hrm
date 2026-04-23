export type AttendanceDayType = 'workday' | 'weekend' | 'holiday';

export interface AttendanceDayData {
  id?: number | string;
  work_date: string;
  day_type: AttendanceDayType;
  check_in?: string | null;
  check_out?: string | null;
  holiday_name?: string | null;
  note?: string | null;
  total_employees?: number;
  status?: {
    on_time: number;
    late: number;
    absent: number;
  } | string;
  late_minutes?: number;
  [key: string]: any;
}

export interface WorkMonthBE {
  id: number | string;
  year: number;
  month: number;
  total_workdays: number;
  note: string | null;
  days: AttendanceDayData[];
}

export interface GenerateAttendanceResponse {
  status: "success";
  message: string;
  data: WorkMonthBE[];
}
export interface CheckInData {
  user_id: number;
  work_date: string;
  calendar_day_id: number;
  rule_id: number;
  check_in: string;
  late_minutes: number;
  status: string;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface CheckInResponse {
  message: string;
  data: CheckInData;
}

export interface MyAttendanceRecord {
  id: number;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: string;
  late_minutes: number;
  early_leave_minutes: number;
  ot_hours: string;
  status: string;
  is_completed: boolean;
  is_edited: boolean;
  note: string | null;
  process_at: string | null;
}

export interface MyAttendanceResponse {
  data: MyAttendanceRecord[];
}

export interface CheckOutResponse {
  message: string;
  data: MyAttendanceRecord
}

