import api from "@/lib/axios";
import { GenerateAttendanceResponse } from "../types/attendance";

export const generateNext3MonthsAttendance = async (): Promise<GenerateAttendanceResponse> => {
  const response = await api.post<GenerateAttendanceResponse>("/work-months/generate-next-3");
  return response.data;
};
