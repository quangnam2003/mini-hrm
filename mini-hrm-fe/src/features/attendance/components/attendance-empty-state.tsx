"use client"

import { CalendarDays } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { GenerateButton } from "./generate-button";

interface AttendanceEmptyStateProps {
  isAdmin?: boolean;
}

export function AttendanceEmptyState({ isAdmin = true }: AttendanceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative size-24 bg-surface rounded-3xl shadow-xl border border-line flex items-center justify-center">
          <CalendarDays className="size-12 text-primary/40" />
        </div>
      </div>
      
      <Typography variant="h3" className="mb-2 text-tx-base">
        Chưa có lịch làm việc
      </Typography>
      
      <Typography variant="p" className="mb-8 text-tx-muted max-w-md mx-auto">
        {isAdmin 
          ? "Hệ thống chưa tìm thấy dữ liệu chấm công cho tháng này. Hãy nhấn nút bên dưới để tự động sinh lịch làm việc cho 3 tháng tới."
          : "Hệ thống chưa có lịch làm việc cho tháng này. Vui lòng thông báo cho quản trị viên để khởi tạo lịch sớm nhất."
        }
      </Typography>

      {isAdmin && (
        <GenerateButton className="h-12 px-8 rounded-2xl text-base shadow-lg hover:shadow-primary/20 transition-all hover:scale-105" />
      )}
    </div>
  );
}

