export interface WorkShift {
  name: string;
  work_start: string;
  work_end: string;
  break_start: string;
  break_end: string;
  half_day_split: string;
}

export interface SaturdayConfig {
  type: "none" | "bi_weekly" | "every_week";
  reference_date?: string;
  reference_type?: "on" | "off";
}

export interface WorkScheduleSetting {
  shifts: {
    office_hours: WorkShift;
  };
  saturday_config: SaturdayConfig;
}

export interface RuleWorkSetting {
  id: number;
  name: string;
  setting: WorkScheduleSetting;
  is_active: boolean;
  apply_from: string | null;
  apply_to: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateWorkSchedulePayload = {
  name: string;
  setting: WorkScheduleSetting;
  is_active: boolean;
};

export type UpdateWorkSchedulePayload = Partial<CreateWorkSchedulePayload> & {
  id: number;
};
