import api from "@/lib/axios";
import { CheckInResponse } from "../types/attendance";

export const checkIn = async (): Promise<CheckInResponse> => {
  const response = await api.post<CheckInResponse>("/attendances/check-in");
  return response.data;
};
