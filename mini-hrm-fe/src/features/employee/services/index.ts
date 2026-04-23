import api from "@/lib/axios";
import {
  CreateEmployeePayload,
  Employee,
  GetListEmployeeParams,
  UpdateEmployeePayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../types";
import { PaginatedResponse } from "@/types/common";

export const getListEmployee = async (
  params: GetListEmployeeParams,
): Promise<PaginatedResponse<Employee>> => {
  const res = await api.get("/employees", {
    params,
  });
  return res.data;
};

export const createEmployee = async (
  data: CreateEmployeePayload,
): Promise<Employee> => {
  const res = await api.post("/employees", data);
  return res.data;
};

export const updateEmployee = async (
  data: UpdateEmployeePayload,
): Promise<Employee> => {
  const { id, ...rest } = data;

  const res = await api.put(`/employees/${id}`, rest);
  return res.data;
};

export const getEmployeeById = async (
  id: number | string,
): Promise<Employee> => {
  const res = await api.get(`/employees/${id}`);
  return res.data.data;
};

export const getMyProfile = async (): Promise<Employee> => {
  const res = await api.get("/employees/my");
  return res.data.data;
};

export const updateEmployeeStatus = async (id: number): Promise<Employee> => {
  const res = await api.patch(`/employees/${id}/status`);
  return res.data;
};

export const updateProfile = async (
  data: FormData | UpdateProfilePayload,
): Promise<Employee> => {
  const isFormData = data instanceof FormData;
  const res = await api.post("/update-profile", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

export const changePassword = async (data: ChangePasswordPayload) => {
  const res = await api.put("/change-password", data);
  return res.data;
};
