"use client";

import React, { useState } from "react";
import { Play, Square, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCheckIn } from "../hooks/use-check-in";
import { useCheckOut } from "../hooks/use-check-out";
import { useAttendanceTodayStatus } from "../hooks/use-attendance-today-status";
import { LeaveRequestDialog } from "@/features/leave/components/LeaveRequestDialog";

interface EmployeeActionsProps {
  onLeaveRequestSuccess?: (data: any) => void;
}

export function EmployeeActions({ onLeaveRequestSuccess }: EmployeeActionsProps) {
  const { isCheckedIn, isCompleted, isLoading: isStatusLoading } = useAttendanceTodayStatus();
  const { mutate: performCheckIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: performCheckOut, isPending: isCheckingOut } = useCheckOut();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const handleCheckInOut = () => {
    if (isCompleted) {
      toast.success("Bạn đã hoàn thành chấm công hôm nay!", {
        description: "Hẹn gặp lại bạn vào ngày mai."
      });
      return;
    }

    if (!isCheckedIn) {
      performCheckIn();
    } else {
      performCheckOut();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Check-in/out Toggle Button */}
      <Button
        onClick={handleCheckInOut}
        isLoading={isCheckingIn || isCheckingOut || isStatusLoading}
        disabled={isCompleted}
        variant={isCompleted ? "outline" : isCheckedIn ? "outline" : "default"}
        className={cn(
          "h-11 px-4 md:px-6 flex items-center gap-2.5 transition-all duration-300 rounded-xl shadow-sm",
          isCompleted
            ? "bg-white text-base border-primary-border shadow-sm opacity-100 cursor-not-allowed"
            : isCheckedIn 
              ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary active:bg-primary/30" 
              : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-95 shadow-primary/20"
        )}
      >
        {isCompleted ? (
          <>
            <CheckCircle size={18} className="text-success animate-in fade-in zoom-in duration-300" />
            <span className="font-bold text-[11px] md:text-sm tracking-wide capitalize">Hoàn thành</span>
          </>
        ) : isCheckedIn ? (
          <>
            <Square size={18} fill="currentColor" strokeWidth={0} className="animate-in fade-in zoom-in duration-300" />
            <span className="font-bold text-[11px] md:text-sm tracking-wide capitalize">Check out</span>
          </>
        ) : (
          <>
            <Play size={18} fill="currentColor" strokeWidth={0} className="animate-in fade-in zoom-in duration-300" />
            <span className="font-bold text-[11px] md:text-sm tracking-wide capitalize">Check in</span>
          </>
        )}
      </Button>


      {/* Create Leave Request Button */}
      <Button
        onClick={() => setIsLeaveDialogOpen(true)}
        className="h-11 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold px-4 md:px-6"
      >
        <Plus size={18} className="mr-2 border-2 rounded-full p-0.5" />
        Tạo đơn xin nghỉ
      </Button>

      <LeaveRequestDialog 
        open={isLeaveDialogOpen} 
        onOpenChange={setIsLeaveDialogOpen}
        onSuccess={onLeaveRequestSuccess}
      />
    </div>
  );
}

