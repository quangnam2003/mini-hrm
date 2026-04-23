import { z } from "zod";

const timeToMinutes = (time: string) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const workShiftSchema = z
  .object({
    name: z.string().min(1, "Tên ca làm việc là bắt buộc"),
    work_start: z.string().min(1, "Giờ bắt đầu là bắt buộc"),
    work_end: z.string().min(1, "Giờ kết thúc là bắt buộc"),
    break_start: z.string().min(1, "Giờ bắt đầu nghỉ là bắt buộc"),
    break_end: z.string().min(1, "Giờ kết thúc nghỉ là bắt buộc"),
    half_day_split: z.string().default("12:00"),
  })
  .refine(
    (data: any) =>
      timeToMinutes(data.work_end) - timeToMinutes(data.work_start) >= 60,
    {
      message: "Giờ tan làm phải sau giờ vào làm ít nhất 1 tiếng",
      path: ["work_end"],
    },
  )
  .refine(
    (data: any) =>
      timeToMinutes(data.break_start) >= timeToMinutes(data.work_start) &&
      timeToMinutes(data.break_end) <= timeToMinutes(data.work_end),
    {
      message: "Thời gian nghỉ trưa phải nằm trong thời gian làm việc",
      path: ["break_start"],
    },
  )
  .refine(
    (data: any) =>
      timeToMinutes(data.break_start) < timeToMinutes(data.break_end),
    {
      message: "Bắt đầu nghỉ trưa phải trước kết thúc nghỉ trưa",
      path: ["break_end"],
    },
  );

export const saturdayConfigSchema = z
  .object({
    type: z.enum(["none", "bi_weekly", "every_week"]),
    reference_date: z.string().optional().nullable(),
    reference_type: z.enum(["on", "off"]).optional().nullable(),
  })
  .refine(
    (data: any) => {
      if (data.type === "bi_weekly") {
        return !!data.reference_date && !!data.reference_type;
      }
      return true;
    },
    {
      message: "Ngày mốc và trạng thái là bắt buộc khi chọn làm việc cách tuần",
      path: ["reference_date"],
    },
  )
  .refine(
    (data: any) => {
      if (data.type === "bi_weekly" && data.reference_date) {
        const date = new Date(data.reference_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today && date.getDay() === 6;
      }
      return true;
    },
    {
      message: "Ngày mốc phải là thứ 7 và từ thời điểm hiện tại",
      path: ["reference_date"],
    },
  );

export const workScheduleSchema = z
  .object({
    name: z.string().min(1, "Tên cấu hình là bắt buộc"),
    setting: z.object({
      shifts: z.object({
        office_hours: workShiftSchema,
      }),
      saturday_config: saturdayConfigSchema,
    }),
  });

export type WorkScheduleFormValues = z.infer<typeof workScheduleSchema>;
