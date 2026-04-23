import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { leaveKeys } from "../query-key";
import {
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  updateLeaveStatuses,
} from "../services";
import {
  UpdateBulkLeaveStatusesPayload,
  UpdateLeaveStatusPayload,
} from "../types";

export function useAdminLeave(params: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}) {
  const adminListQuery = useQuery({
    queryKey: leaveKeys.adminPaginated(params),
    queryFn: () => getAllLeaveRequests(params),
    placeholderData: keepPreviousData,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: UpdateLeaveStatusPayload }) =>
      approveLeaveRequest(id, payload),
    onSuccess: () => {
      toast.success("Đã duyệt đơn nghỉ phép");
      queryClient.invalidateQueries({ queryKey: leaveKeys.admin() });
    },
    onError: (error: any) => {
      handleError(error, "Không thể duyệt đơn");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: UpdateLeaveStatusPayload }) =>
      rejectLeaveRequest(id, payload),
    onSuccess: () => {
      toast.success("Đã từ chối đơn nghỉ phép");
      queryClient.invalidateQueries({ queryKey: leaveKeys.admin() });
    },
    onError: (error: any) => {
      handleError(error, "Không thể từ chối đơn");
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: (payload: UpdateBulkLeaveStatusesPayload) => updateLeaveStatuses(payload),
    onSuccess: (_, variables) => {
      const statusText = variables.status === "approved" ? "duyệt" : "từ chối";
      toast.success(`Đã ${statusText} các đơn đã chọn`);
      queryClient.invalidateQueries({ queryKey: leaveKeys.admin() });
    },
    onError: (error: any) => {
      handleError(error, "Không thể cập nhật trạng thái");
    },
  });

  return {
    adminListQuery,
    approveLeave: approveMutation.mutate,
    rejectLeave: rejectMutation.mutate,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
    isFetching: adminListQuery.isFetching,
  };
}
