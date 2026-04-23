import { useMemo } from "react";
import { useGetMyAttendance } from "./use-get-my-attendance";
import { format } from "date-fns";

export function useAttendanceTodayStatus() {
  const { data: attendanceHistory, isLoading } = useGetMyAttendance();
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const result = useMemo(() => {
    if (!attendanceHistory?.data) {
      return {
        isCheckedIn: false,
        isCompleted: false,
        todayRecord: null
      };
    }

    const todayRecord = attendanceHistory.data.find(record => record.work_date === todayStr);

    return {
      isCheckedIn: !!todayRecord,
      isCompleted: todayRecord?.is_completed ?? false,
      todayRecord: todayRecord || null
    };
  }, [attendanceHistory, todayStr]);

  return { 
    ...result,
    isLoading
  };
}
