import { useQuery } from "@tanstack/react-query";
import { getAllPermissions } from "../api/get-all-permissions";
import { mapPermissionModulesFromApi } from "@/features/permission-management/adapters/permission";
import { permissionKeys } from "../queryKeys/permission";

export function useGetPermissions() {
  return useQuery({
    queryKey: permissionKeys.lists(), 
    queryFn: getAllPermissions,
    select: mapPermissionModulesFromApi
  });
}
