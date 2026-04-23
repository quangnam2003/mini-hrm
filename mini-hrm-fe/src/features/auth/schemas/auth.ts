import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Vui lòng điền email" })
    .email({ message: "Email không đúng định dạng" })
    .max(255, { message: "Email tối đa 255 ký tự" }),
  password: z
    .string()
    .min(1, { message: "Vui lòng điền mật khẩu" })
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

