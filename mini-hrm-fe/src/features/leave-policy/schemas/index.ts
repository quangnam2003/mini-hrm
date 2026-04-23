import { z } from "zod";

export const leaveTypeSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên loại nghỉ phép"),
  is_paid: z.boolean().default(true),
  default_days: z.coerce.number().min(0, "Số ngày mặc định không được âm"),
  allow_half_day: z.boolean().default(true),
  allow_hourly: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
