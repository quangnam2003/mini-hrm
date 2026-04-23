import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { queryClient } from "@/lib/query-client";
import { attendanceKeys } from "../queryKeys/attendance";
import { checkIn } from "../api/check-in";

export function useCheckIn() {
  return useMutation({
    mutationFn: checkIn,
    onSuccess: (res) => {
      toast.success(res.message || "Check-in thành công");

      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.my() });
    },
    onError: (error) => {
      handleError(error, "Lỗi khi thực hiện check-in");
    },
  });
}
