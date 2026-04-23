"use client";

import React, { createContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getMyPermissions } from "@/features/auth/api/get-permissions";
import { normalizePermissions } from "@/features/auth/utils/permission-utils";
import { authKeys } from "@/features/auth/queryKeys/auth";
import { ALL_PERMISSIONS } from "@/features/auth/constants/permissions";


const getModule = (permission: string): string => permission.split(".")[0];


interface AuthContextType {
  permissions: string[];
  isPermissionsLoading: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  /** ALL of the given permissions */
  hasAllPermissions: (permissions: string[]) => boolean;
  /** True if user has ANY permission belonging to the given module */
  hasModuleAccess: (module: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  const { data: rawPermissions, isLoading: isPermissionsLoading } = useQuery({
    queryKey: authKeys.permissions(userId as string),
    queryFn: () => getMyPermissions(),
    enabled: status === "authenticated" && !!userId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Normalize to string[] ────────────────────────────────────────────────
  const permissions = useMemo(() => {
    return normalizePermissions(rawPermissions?.data, role);
  }, [rawPermissions, role]);

  // ── Optimized Sets (built once per permissions change) ───────────────────

  /** O(1) exact permission lookup */
  const permissionsSet = useMemo(() => new Set(permissions), [permissions]);

  /**
   * Set of module names derived from the user's permissions.
   * e.g. ["employee.update", "leave.view"] → Set { "employee", "leave" }
   * The wildcard "*" is intentionally excluded — use isAdmin for admin logic.
   */
  const moduleSet = useMemo(() => {
    const modules = new Set<string>();
    for (const p of permissions) {
      if (p !== ALL_PERMISSIONS) {
        modules.add(getModule(p));
      }
    }
    // DEBUG — remove after confirming
    console.log("[RBAC] role:", role, "| permissions:", permissions, "| moduleSet:", [...modules]);
    return modules;
  }, [permissions]);

  // ── Derived booleans & check functions ──────────────────────────────────

  /** Single source of truth for admin status */
  const isAdmin = useMemo(
    () => permissionsSet.has(ALL_PERMISSIONS),
    [permissionsSet]
  );

  const hasPermission = useMemo(
    () =>
      (permission: string): boolean =>
        isAdmin || permissionsSet.has(permission),
    [isAdmin, permissionsSet]
  );

  const hasAnyPermission = useMemo(
    () =>
      (required: string[]): boolean =>
        isAdmin || required.some((p) => permissionsSet.has(p)),
    [isAdmin, permissionsSet]
  );

  const hasAllPermissions = useMemo(
    () =>
      (required: string[]): boolean =>
        isAdmin || required.every((p) => permissionsSet.has(p)),
    [isAdmin, permissionsSet]
  );

  /** Show a module's management tab if user has ANY permission in that module */
  const hasModuleAccess = useMemo(
    () =>
      (module: string): boolean =>
        isAdmin || moduleSet.has(module),
    [isAdmin, moduleSet]
  );

  // ── Context value ────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      permissions,
      isPermissionsLoading,
      isAdmin,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasModuleAccess,
    }),
    [
      permissions,
      isPermissionsLoading,
      isAdmin,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasModuleAccess,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
