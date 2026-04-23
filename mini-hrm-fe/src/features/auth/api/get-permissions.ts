import api from "@/lib/axios";
import { PermissionResponse } from "../types/permissions";

export const getMyPermissions = async () => {
  const response = await api.get<PermissionResponse>(`/permissions/my`);
  return response.data;
};
