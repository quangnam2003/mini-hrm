"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { BulkLeaveInitModal } from "./BulkLeaveInitModal";
import { Can } from "@/components/common/auth/Can";

interface BulkLeaveInitToolbarProps {
  employees: any[];
  selectedEmployeeIds: number[];
  onClearSelection: () => void;
}

export function BulkLeaveInitToolbar({
  employees,
  selectedEmployeeIds,
  onClearSelection,
}: BulkLeaveInitToolbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (selectedEmployeeIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] p-1.5 flex items-center gap-1 border border-slate-200/60 ring-1 ring-slate-900/5">
          <div className="flex items-center gap-3 pl-4 pr-3 border-r border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20 ring-4 ring-primary/10">
              <span className="font-bold text-sm tabular-nums">
                {selectedEmployeeIds.length}
              </span>
            </div>
            <Typography
              variant="small"
              className="text-[13px] font-semibold text-slate-600 tracking-tight whitespace-nowrap"
            >
              nhân viên đã chọn
            </Typography>
          </div>

          <div className="flex items-center gap-2 px-2">
            <Can permission="leave_balance.edit">
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-10 px-5 rounded-2xl gap-2.5 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all duration-300 font-bold text-[13px]"
              >
                <CalendarDays size={15} strokeWidth={2.5} />
                Khởi tạo ngày phép
              </Button>
            </Can>
          </div>

          <div className="pl-1 pr-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-9 w-9 p-0 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      <BulkLeaveInitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedEmployeeIds={selectedEmployeeIds}
        employees={employees}
      />
    </>
  );
}
