"use client";

import { useContext } from "react";
import { useSession } from "next-auth/react";
import { AuthContext } from "@/providers/auth-provider";

export function useAuth() {
  const { data: session, status } = useSession();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    permissions,
    isPermissionsLoading,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
  } = context;

  // Global loading: session resolving OR permissions still fetching
  const isLoading = status === "loading" || isPermissionsLoading;

  return {
    user: session?.user,
    permissions,
    status,
    isLoading,
    isPermissionsLoading,
    isAuthenticated: status === "authenticated",
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
  };
}
