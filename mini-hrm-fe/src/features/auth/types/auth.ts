import { z } from "zod";
import { loginSchema } from "@/features/auth/schemas/auth";

export type Role = "admin" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  empCode: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  role: Role;
  is_active: number;
}

export type LoginFormValues = z.infer<typeof loginSchema>;