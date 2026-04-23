import { ALL_PERMISSIONS } from "../constants/permissions";
import { PermissionItem } from "../types/permissions";


export const normalizePermissions = (
  rawPermissions: PermissionItem[] | undefined,
  role?: string
): string[] => {
  // Admin always has full access — regardless of what DB returns
  if (role === "admin") {
    return [ALL_PERMISSIONS];
  }

  if (!rawPermissions) return [];

  return rawPermissions.map((p) => p.key);
};
