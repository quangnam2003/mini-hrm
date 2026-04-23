import { z } from "zod";

export const leaveActionSchema = z.object({
  approver_note: z.string().optional(),
});

export type LeaveActionFormValues = z.infer<typeof leaveActionSchema>;
