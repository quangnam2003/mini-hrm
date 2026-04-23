import api from "@/lib/axios";
import {
  CreateLeaveTypePayload,
  LeaveBalanceInitPayload,
  LeaveType,
  UpdateLeaveTypePayload,
  UpdateLeaveBalancePayload,
} from "../types";

export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  const res = await api.get("/leave-type");
  return res.data.data;
};

export const createLeaveType = async (
  data: CreateLeaveTypePayload,
): Promise<LeaveType> => {
  const res = await api.post("/leave-type", data);
  return res.data;
};

export const updateLeaveType = async (
  data: UpdateLeaveTypePayload,
): Promise<LeaveType> => {
  const { id, ...rest } = data;
  const res = await api.put(`/leave-type/${id}`, rest);
  return res.data;
};

export const deleteLeaveType = async (id: number): Promise<void> => {
  await api.delete(`/leave-type/${id}`);
};

export const initLeaveBalance = async (
  data: LeaveBalanceInitPayload,
): Promise<{ message: string }> => {
  const res = await api.post("/leave-balance/init", data);
  return res.data;
};

export const updateLeaveBalance = async (
  data: UpdateLeaveBalancePayload,
): Promise<{ message: string }> => {
  const { id, ...rest } = data;
  const res = await api.put(`/leave-balance/${id}`, rest);
  return res.data;
};
