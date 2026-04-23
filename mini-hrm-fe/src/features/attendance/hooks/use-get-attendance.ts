import { useQuery } from "@tanstack/react-query";
import { getAttendanceData } from "../api/get-attendance";
import { attendanceKeys } from "../queryKeys/attendance";
import { AttendanceDayData } from "../types/attendance";

export function useGetAttendance() {
  return useQuery({
    queryKey: attendanceKeys.lists(),
    queryFn: async () => {
      const response = await getAttendanceData();
      const flatDays: AttendanceDayData[] = response.data.flatMap(month => month.days);
      
      return flatDays;
    },
    staleTime: 1000 * 60 * 5, 
  });
}
