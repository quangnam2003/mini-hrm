import api from "@/lib/axios";
import { PermissionAssignPayload } from "@/features/permission-management/types/permission";

export const savePermissions = async (data: PermissionAssignPayload[]) => {
  await api.post("/permissions/assign-users", data);
}
