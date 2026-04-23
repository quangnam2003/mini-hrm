import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { leavePolicyKeys } from "../query-key/leave-policy.query-key";
import {
  createLeaveType,
  deleteLeaveType,
  getLeaveTypes,
  initLeaveBalance,
  updateLeaveType,
  updateLeaveBalance,
} from "../services";
import {
  CreateLeaveTypePayload,
  LeaveBalanceInitPayload,
  UpdateLeaveTypePayload,
  UpdateLeaveBalancePayload,
} from "../types";
import { queryClient } from "@/lib/query-client";

export function useLeavePolicy() {

  const leaveTypesQuery = useQuery({
    queryKey: leavePolicyKeys.list(),
    queryFn: getLeaveTypes,
  });

  const createLeaveTypeMutation = useMutation({
    mutationFn: (payload: CreateLeaveTypePayload) => createLeaveType(payload),
    onSuccess: () => {
      toast.success("Thêm loại nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.all });
    },
    onError: (error) => {
      handleError(error, "Không thể thêm loại nghỉ phép");
    },
  });

  const updateLeaveTypeMutation = useMutation({
    mutationFn: (payload: UpdateLeaveTypePayload) => updateLeaveType(payload),
    onSuccess: () => {
      toast.success("Cập nhật loại nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.all });
    },
    onError: (error) => {
      handleError(error, "Không thể cập nhật loại nghỉ phép");
    },
  });

  const deleteLeaveTypeMutation = useMutation({
    mutationFn: (id: number) => deleteLeaveType(id),
    onSuccess: () => {
      toast.success("Xóa loại nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.all });
    },
    onError: (error) => {
      handleError(error, "Không thể xóa loại nghỉ phép");
    },
  });

  const initLeaveBalanceMutation = useMutation({
    mutationFn: (payload: LeaveBalanceInitPayload) => initLeaveBalance(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Khởi tạo ngày phép thành công");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      handleError(error, "Không thể khởi tạo ngày phép");
    },
  });

  const updateLeaveBalanceMutation = useMutation({
    mutationFn: (payload: UpdateLeaveBalancePayload) => updateLeaveBalance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      handleError(error, "Không thể cập nhật hạn mức phép");
    },
  });

  return {
    leaveTypes: leaveTypesQuery.data ?? [],
    isLoading: leaveTypesQuery.isLoading,
    isFetching: leaveTypesQuery.isFetching,
    createLeaveType: createLeaveTypeMutation.mutate,
    updateLeaveType: updateLeaveTypeMutation.mutate,
    deleteLeaveType: deleteLeaveTypeMutation.mutate,
    initLeaveBalance: initLeaveBalanceMutation.mutate,
    updateLeaveBalance: updateLeaveBalanceMutation.mutate,
    isCreating: createLeaveTypeMutation.isPending,
    isUpdating: updateLeaveTypeMutation.isPending,
    isDeleting: deleteLeaveTypeMutation.isPending,
    isInitializing: initLeaveBalanceMutation.isPending,
  };
}
