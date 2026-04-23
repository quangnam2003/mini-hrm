import { GetListEmployeeParams } from "../types";

export const employeeKeys = {
  all: ["employees"] as const,
  list: (params?: GetListEmployeeParams) =>
    params
      ? ([...employeeKeys.all, "list", params] as const)
      : ([...employeeKeys.all, "list"] as const),
  detail: (id: number | string) => [...employeeKeys.all, "detail", id] as const,
  stats: () => [...employeeKeys.all, "stats"] as const,
};
