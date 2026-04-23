"use client"

import { Button } from "@/components/ui/button";
import { useAttendanceStore } from "../stores/attendance";
import { useGenerateAttendance } from "../hooks/use-generate-attendance";
import { Loader2, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
  showIcon?: boolean;
}

export function GenerateButton({ 
  variant = "default", 
  className,
  showIcon = true 
}: GenerateButtonProps) {
  const { mutate: generateSchedule, isPending } = useGenerateAttendance();

  return (
    <Button
      variant={variant}
      disabled={isPending}
      onClick={() => generateSchedule()}
      className={cn("gap-2 shadow-sm font-bold", className)}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        showIcon && <CalendarPlus className="size-4" />
      )}
      {isPending ? "Đang xử lý..." : "Sinh lịch làm việc"}
    </Button>
  );
}

