import api from "@/lib/axios";
import { MyAttendanceResponse } from "../types/attendance";

export const getMyAttendanceHistory = async (): Promise<MyAttendanceResponse> => {
  const response = await api.get<MyAttendanceResponse>("/attendances/my");
  return response.data;
};
