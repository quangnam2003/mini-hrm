import {
  keepPreviousData,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { handleError } from "@/utils/error-handler";
import { employeeKeys } from "../query-key/employees.query-key";
import {
  createEmployee,
  getListEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from "../services";
import { Employee, GetListEmployeeParams } from "../types";
import { queryClient } from "@/lib/query-client";

export function useEmployees(params: GetListEmployeeParams) {

  const statsQueryEmployee = useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: () => getListEmployee({ per_page: 9999, role: "employee" }),
    staleTime: 5 * 60 * 1000,
  });

  const listQueryEmployee = useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => getListEmployee(params),
    placeholderData: keepPreviousData,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Thêm nhân viên thành công");
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (err) => {
      handleError(err, "Không thể thêm nhân viên");
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: updateEmployee,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.all });
      const previousData = queryClient.getQueryData(employeeKeys.list(params));

      if (previousData) {
        queryClient.setQueryData(employeeKeys.list(params), (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((emp: Employee) =>
              emp.id === variables.id ? { ...emp, ...variables } : emp,
            ),
          };
        });
      }
      return { previousData };
    },
    onError: (err, _, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          employeeKeys.list(params),
          context.previousData,
        );
      }
      handleError(err, "Không thể cập nhật thông tin");
    },
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.list(params) });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: updateEmployeeStatus,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.all });
      const previousData = queryClient.getQueryData(employeeKeys.list(params));

      if (previousData) {
        queryClient.setQueryData(employeeKeys.list(params), (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((emp: Employee) =>
              emp.id === id ? { ...emp, is_active: !emp.is_active } : emp,
            ),
          };
        });
      }
      return { previousData };
    },
    onError: (err, _, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          employeeKeys.list(params),
          context.previousData,
        );
      }
      handleError(err, "Không thể cập nhật trạng thái");
    },
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: employeeKeys.stats() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.list(params) });
    },
  });

  return {
    listQueryEmployee,
    statsQueryEmployee,
    createEmployee: createEmployeeMutation.mutate,
    updateEmployee: updateEmployeeMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    isCreating: createEmployeeMutation.isPending,
    isUpdating: updateEmployeeMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isFetching: listQueryEmployee.isFetching,
  };
}
