"use client";

import { useAuth } from "../hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/constants/routes";
import { Typography } from "@/components/ui/typography";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(routes.auth.login);
    }
  }, [status, router]);
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface animate-in fade-in duration-500">
        <div className="relative flex flex-col items-center gap-6">
          {/* Animated Logo / Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
            <div className="absolute inset-0 border-3 border-primary/20 rounded-2xl" />
            <div className="absolute inset-0 border-3 border-primary rounded-2xl animate-spin duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary font-bold text-[10px] tracking-tight">HR</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <Typography variant="h4" className="text-sm font-semibold tracking-tight text-primary">
              MINI HRM
            </Typography>
            <Typography variant="p" className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] animate-pulse">
              Đang xác thực bảo mật...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
