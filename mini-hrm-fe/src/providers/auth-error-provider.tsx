"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

/**
 * AuthErrorProvider monitors session status and handles authentication errors.
 *
 * Only triggers when session expires mid-use (authenticated → unauthenticated).
 * Does NOT trigger on initial page load (loading → unauthenticated on login page).
 */
export function AuthErrorProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const wasAuthenticated = useRef(false);
  const hasShownMessage = useRef(false);

  useEffect(() => {
    // Track when user was previously authenticated
    if (status === "authenticated") {
      wasAuthenticated.current = true;
    }

    // Only show error if session expired mid-use (not on initial load)
    if (status === "unauthenticated" && wasAuthenticated.current && !hasShownMessage.current) {
      hasShownMessage.current = true;

      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        duration: 4000,
      });

      setTimeout(() => {
        signOut({ callbackUrl: "/", redirect: true });
      }, 500);
    }
  }, [status]);

  return <>{children}</>;
}
