import api from "@/lib/axios";
import { GenerateAttendanceResponse } from "../types/attendance";

export const getAttendanceData = async (): Promise<GenerateAttendanceResponse> => {
  const response = await api.get<GenerateAttendanceResponse>("/work-months");
  return response.data;
};
