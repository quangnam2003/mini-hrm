import api from "@/lib/axios";
import { CheckOutResponse } from "../types/attendance";

export const checkOut = async (): Promise<CheckOutResponse> => {
  const response = await api.post<CheckOutResponse>("/attendances/check-out");
  return response.data;
};
