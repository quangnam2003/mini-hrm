import api from "@/lib/axios";
import { AllPermissionsResponseBE } from "../types/permission";

export const getAllPermissions = async (): Promise<AllPermissionsResponseBE> => {
  const response = await api.get<{ data: AllPermissionsResponseBE }>("/permissions/all");
  return response.data.data;
}