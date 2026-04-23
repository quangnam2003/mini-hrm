import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { leaveKeys } from "../query-key";
import {
  createLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
} from "../services";
import { CreateLeaveRequestPayload } from "../types";

export function useLeave(params?: { page?: number; per_page?: number }) {
  const historyQuery = useQuery({
    queryKey: leaveKeys.myPaginated(params || {}),
    queryFn: () => getMyLeaveRequests(params || {}),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => createLeaveRequest(payload),
    onSuccess: () => {
      toast.success("Tạo đơn xin nghỉ thành công");
      queryClient.invalidateQueries({ queryKey: leaveKeys.my() });
    },
    onError: (error: any) => {
      handleError(error, "Không thể tạo đơn xin nghỉ");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelLeaveRequest(id),
    onSuccess: () => {
      toast.success("Đã từ chối đơn xin nghỉ");
      queryClient.invalidateQueries({ queryKey: leaveKeys.my() });
    },
    onError: (error: any) => {
      handleError(error, "Không thể hủy đơn xin nghỉ");
    },
  });

  return {
    historyQuery,
    createLeave: createMutation.mutate,
    cancelLeave: cancelMutation.mutate,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isFetching: historyQuery.isFetching,
  };
}
