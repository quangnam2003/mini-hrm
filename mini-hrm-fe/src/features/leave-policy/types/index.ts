export interface LeaveType {
  id: number;
  name: string;
  is_paid: number;
  default_days: number;
  allow_half_day: number;
  allow_hourly: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalanceInitPayload {
  user_ids: number[];
  leave_type_id: number;
  year: number;
  should_reset: boolean;
}

export type CreateLeaveTypePayload = Omit<
  LeaveType,
  "id" | "created_at" | "updated_at"
>;

export type UpdateLeaveTypePayload = Partial<CreateLeaveTypePayload> & {
  id: number;
};

export interface UpdateLeaveBalancePayload {
  id: number;
  leave_type_id: number;
  balance: number;
  year: number;
  used_days: number;
}
