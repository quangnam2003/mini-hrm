import { Role } from "@/features/auth/types/auth";

export interface Employee {
  id: number;
  empCode: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: Role;
  is_active: boolean;
  avatar_url: string | null;
  created_by: {
    id: number;
    name: string;
  } | null;
  leave_balances?: LeaveBalance[];
  created_at: string;
  updated_at: string;
}

export type GetListEmployeeParams = {
  page?: number;
  per_page?: number;
  email?: string;
  name?: string;
  empCode?: string;
  role?: Role;
  is_active?: boolean;
};

export type CreateEmployeePayload = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role?: Role;
  address?: string;
  phone?: string;
  is_active?: boolean;
  leave_balances?: Partial<LeaveBalance>[];
};

export type UpdateEmployeePayload = {
  id: number;
  empCode?: string;
  name?: string;
  email?: string;
  role?: Role;
  address?: string;
  phone?: string;
  is_active?: boolean;
  leave_balances?: Partial<LeaveBalance>[];
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: File;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export interface LeaveType {
  id: number;
  name: string;
  is_paid: number;
}

export interface LeaveBalance {
  id: number;
  leave_type: LeaveType;
  year: number;
  balance: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export type StatusFilter = "all" | "active" | "inactive";
