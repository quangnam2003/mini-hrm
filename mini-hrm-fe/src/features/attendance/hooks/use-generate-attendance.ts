import { useMutation } from "@tanstack/react-query";
import { generateNext3MonthsAttendance } from "../api/generate-attendance";
import { attendanceKeys } from "../queryKeys/attendance";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { queryClient } from "@/lib/query-client";

export function useGenerateAttendance() {
  return useMutation({
    mutationFn: generateNext3MonthsAttendance,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      
      toast.success(response.message || "Đã tự động sinh lịch cho 3 tháng tới.", {
        description: "Lịch làm việc đã được cập nhật thành công.",
      });
    },
    onError: (error) => {
      handleError(error, "Không thể sinh lịch làm việc");
    }
  });
}
