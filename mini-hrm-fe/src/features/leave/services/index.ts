import api from "@/lib/axios";
import {
  CreateLeaveRequestPayload,
  LeaveRequestResponse,
  UpdateBulkLeaveStatusesPayload,
  UpdateLeaveStatusPayload,
} from "../types";

export const createLeaveRequest = async (
  payload: CreateLeaveRequestPayload,
): Promise<any> => {
  const res = await api.post("/leave-request", payload);
  return res.data;
};

export const getMyLeaveRequests = async (params: {
  page?: number;
  per_page?: number;
}): Promise<LeaveRequestResponse> => {
  const res = await api.get("/leave-request/my", { params });
  return res.data;
};

export const cancelLeaveRequest = async (id: number): Promise<any> => {
  const res = await api.post(`/leave-request/${id}/cancel`);
  return res.data;
};

export const getAllLeaveRequests = async (params: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}): Promise<LeaveRequestResponse> => {
  const res = await api.get("/leave-request", { params });
  return res.data;
};

export const approveLeaveRequest = async (
  id: number,
  payload?: UpdateLeaveStatusPayload,
): Promise<any> => {
  const res = await api.post(`/leave-request/${id}/approve`, payload);
  return res.data;
};

export const rejectLeaveRequest = async (
  id: number,
  payload?: UpdateLeaveStatusPayload,
): Promise<any> => {
  const res = await api.post(`/leave-request/${id}/reject`, payload);
  return res.data;
};

export const updateLeaveStatuses = async (
  payload: UpdateBulkLeaveStatusesPayload,
): Promise<any> => {
  const res = await api.post("/leave-request/update-statuses", payload);
  return res.data;
};
