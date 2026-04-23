import { LeaveType } from "../../leave-policy/types";

export type RequestScope = "hourly" | "full_day" | "half_day";
export type HalfDayPeriod = "morning" | "afternoon";
export type AmountUnit = "hours" | "days";
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface UserInfo {
  id: number;
  name: string;
  empCode: string;
  avatar?: string;
  avatar_url?: string;
}


export interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type_id: number;
  request_scope: RequestScope;
  half_day_period: HalfDayPeriod | null;
  start_time: string;
  end_time: string;
  total_amount: number;
  amount_unit: AmountUnit;
  attachment: string | null;
  reason: string;
  status: LeaveStatus;
  approver_note: string | null;
  process_by: number | null;
  process_at: string | null;
  created_at: string;
  updated_at: string;
  leave_type: LeaveType;
  user?: UserInfo;
}

export interface CreateLeaveRequestPayload {
  leave_type_id: number | null;
  request_scope: RequestScope;
  half_day_period?: HalfDayPeriod | null;
  start_time: string;
  end_time: string;
  amount_unit: AmountUnit;
  reason: string;
}

export interface LeaveRequestResponse {
  current_page: number;
  data: LeaveRequest[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface UpdateLeaveStatusPayload {
  status: "approved" | "rejected";
  approver_note?: string;
}

export interface UpdateBulkLeaveStatusesPayload {
  ids: number[];
  status: "approved" | "rejected";
  approver_note?: string;
}
