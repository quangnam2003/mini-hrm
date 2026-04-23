import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { queryClient } from "@/lib/query-client";
import {
  getRuleWorkSettings,
  createRuleWorkSetting,
  updateRuleWorkSetting,
  deleteRuleWorkSetting,
  setActiveRuleWorkSetting,
} from "../services";
import { workScheduleKeys } from "../query-key";

export const useWorkSchedule = () => {

  const query = useQuery({
    queryKey: workScheduleKeys.lists(),
    queryFn: getRuleWorkSettings,
  });

  const createMutation = useMutation({
    mutationFn: createRuleWorkSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      toast.success("Thêm cấu hình làm việc thành công");
    },
    onError: (error) => {
      handleError(error, "Lỗi khi thêm cấu hình");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRuleWorkSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      toast.success("Cập nhật cấu hình thành công");
    },
    onError: (error) => {
      handleError(error, "Lỗi khi cập nhật cấu hình");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRuleWorkSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      toast.success("Xóa cấu hình thành công");
    },
    onError: (error) => {
      handleError(error, "Lỗi khi xóa cấu hình");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: setActiveRuleWorkSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workScheduleKeys.lists() });
      toast.success("Đã thay đổi trạng thái cấu hình");
    },
    onError: (error) => {
      handleError(error, "Lỗi khi thay đổi trạng thái");
    },
  });

  return {
    workSchedules: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createWorkSchedule: createMutation.mutate,
    updateWorkSchedule: updateMutation.mutate,
    deleteWorkSchedule: deleteMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleActiveMutation.isPending,
  };
};
