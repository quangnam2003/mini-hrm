import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    is_paid: z.boolean().default(true),
    leave_type_id: z.any().nullable().optional(),
    request_scope: z.enum(["full_day", "half_day", "hourly"]),
    half_day_period: z.enum(["morning", "afternoon"]).nullable().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    start_hour: z.string().optional(),
    end_hour: z.string().optional(),
    reason: z.string().min(1, "Vui lòng nhập lý do xin nghỉ"),
  })
  .refine(
    (data) => {
      if (data.is_paid && (!data.leave_type_id || Number(data.leave_type_id) < 1)) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn loại nghỉ phép",
      path: ["leave_type_id"],
    }
  )
  .refine(
    (data) => {
      if (data.request_scope === "hourly") {
        if (!data.start_time) return false;
      } else {
        if (!data.start_time || !data.end_time) return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn ngày nghỉ",
      path: ["start_time"],
    },
  )
  .refine(
    (data) => {
      if (data.request_scope === "half_day" && !data.half_day_period) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn buổi nghỉ",
      path: ["half_day_period"],
    },
  )
  .refine(
    (data) => {
      if (data.request_scope === "hourly") {
        if (!data.start_hour || !data.end_hour) return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn giờ nghỉ",
      path: ["start_hour"],
    },
  );

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
