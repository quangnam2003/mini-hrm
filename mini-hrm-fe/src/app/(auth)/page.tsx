import React from "react";
import { Users } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Typography } from "@/components/ui/typography";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <Typography variant="h2" as="h1" className="font-extrabold text-primary tracking-tight">
              Mini HRM
            </Typography>
          </div>
          <Typography variant="p" className="text-muted text-sm px-6">
            Hệ thống quản trị nguồn nhân lực tập trung
          </Typography>
        </div>

        <LoginForm />

        <div className="mt-8 pt-6 border-t border-line text-center">
          <Typography variant="p" className="text-muted text-xs">
            © 2026 HRM System. Bảo mật & Tin cậy.
          </Typography>
        </div>
      </div>
    </div>
  );
}
