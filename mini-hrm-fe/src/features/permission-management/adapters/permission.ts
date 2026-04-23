import { getInitials } from "@/utils/avatar";
import { ModuleAPIResponse, AllPermissionsResponseBE, UserAPIResponse, PermissionAssignPayload } from "../types/permission";
import { Employee } from "@/features/employee/types";

// api -> fe
export function mapEmployeeToUserResponse(employee: Employee): UserAPIResponse {
  return {
    id: String(employee.id),
    empCode: employee.empCode,
    name: employee.name,
    email: employee.email,
    avatar: employee.avatar_url || undefined,
    shortName: getInitials(employee.name)
  };
}

export function mapPermissionModulesFromApi(dataObj: AllPermissionsResponseBE): ModuleAPIResponse[] {
  if (!dataObj) return [];

  return Object.keys(dataObj).map((key) => {
    const item = dataObj[key];

    return {
      id: item.module || key,
      name: item.module_name || key,
      permissions: (item.permissions || []).map((perm) => ({
        id: String(perm.id),
        name: perm.description,
        code: perm.key,
        users: (perm.users || []).map((user) => ({
          id: String(user.id),
          empCode: user.empCode || "",
          name: user.name,
          email: user.email,
          avatar: user.avatar_url || undefined,
          shortName: getInitials(user.name)
        }))
      }))
    };
  });
}

// fe -> api
export function mapPermissionsToAssignPayload(modules: ModuleAPIResponse[]): PermissionAssignPayload[] {
  return modules.flatMap((module) =>
    module.permissions
      .map((permission) => ({
        permission_id: Number(permission.id),
        user_ids: permission.users
          .map((user) => Number(user.id))
          .filter((id) => !isNaN(id)),
      }))
  );
}
