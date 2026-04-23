"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface CanProps {
  /** Permission string (e.g. "employee.create") or array of strings for ANY check */
  permission?: string | string[];
  /** Array of strings for ALL check */
  all?: string[];
  /** Content to show if user has permission */
  children: React.ReactNode;
  /** Content to show if user doesn't have permission (optional) */
  fallback?: React.ReactNode;
}

export function Can({ permission, all, children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isPermissionsLoading } = useAuth();

  if (isPermissionsLoading) {
    return null;
  }

  let allowed = false;

  if (all && all.length > 0) {
    allowed = hasAllPermissions(all);
  } else if (Array.isArray(permission)) {
    allowed = hasAnyPermission(permission);
  } else if (typeof permission === "string") {
    allowed = hasPermission(permission);
  } else {
    // If no permission is specified, allow by default
    allowed = true;
  }

  if (allowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
