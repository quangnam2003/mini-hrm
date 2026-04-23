"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Typography } from "@/components/ui/typography";
import { useAttendanceStore } from "@/features/attendance/stores/attendance";

export function MonthNavigator() {
  const { viewDate, nextMonth, prevMonth } = useAttendanceStore();

  return (
    <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-line shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="size-8 rounded-lg"
        onClick={prevMonth}
      >
        <ChevronLeft className="size-4" />
      </Button>
      
      <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
        <Calendar className="size-4 text-primary" />
        <Typography variant="p" className="font-bold text-tx-base capitalize">
          {format(viewDate, "MMMM, yyyy", { locale: vi })}
        </Typography>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="size-8 rounded-lg"
        onClick={nextMonth}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
