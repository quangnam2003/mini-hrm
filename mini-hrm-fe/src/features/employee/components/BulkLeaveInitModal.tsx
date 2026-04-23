"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { useLeavePolicy } from "@/features/leave-policy/hooks/use-leave-policy";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Employee } from "@/features/employee/types";

interface BulkLeaveInitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployeeIds: number[];
  employees: Employee[];
  onSuccess?: () => void;
}

export function BulkLeaveInitModal({
  open,
  onOpenChange,
  selectedEmployeeIds,
  employees,
  onSuccess,
}: BulkLeaveInitModalProps) {
  const {
    leaveTypes,
    isLoading: isLoadingTypes,
    initLeaveBalance: initBalance,
    isInitializing: isPending,
  } = useLeavePolicy();
  const [processedTypes, setProcessedTypes] = useState<number[]>([]);
  const [shouldReset, setShouldReset] = useState(false);

  const paidLeaveTypes =
    leaveTypes?.filter((type) => type.is_paid && type.is_active) || [];

  const currentYear = new Date().getFullYear();

  const isAlreadyInitialized = (typeId: number) => {
    return employees
      .filter((emp) => selectedEmployeeIds.includes(emp.id))
      .some((emp) =>
        emp.leave_balances?.some(
          (lb) => lb.leave_type.id === typeId && lb.year === currentYear,
        ),
      );
  };

  const handleInit = (typeId: number) => {
    initBalance(
      {
        user_ids: selectedEmployeeIds,
        leave_type_id: typeId,
        year: currentYear,
        should_reset: !!shouldReset,
      },
      {
        onSuccess: () => {
          setProcessedTypes((prev) => [...prev, typeId]);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-2xl border-none shadow-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays size={20} strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Khởi tạo ngày phép
              </DialogTitle>
              <DialogDescription className="text-xs">
                Thiết lập hạn mức nghỉ phép cho {selectedEmployeeIds.length}{" "}
                nhân viên
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Typography
              variant="label"
              className="text-[11px] text-slate-400 font-bold uppercase tracking-widest"
            >
              Chọn loại ngày phép
            </Typography>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {isLoadingTypes ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Loader2 size={24} className="animate-spin text-primary" />
              <Typography
                variant="small"
                className="text-slate-400 font-medium"
              >
                Đang tải danh sách...
              </Typography>
            </div>
          ) : paidLeaveTypes.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <AlertCircle size={24} className="text-slate-300" />
              <Typography
                variant="small"
                className="text-slate-400 font-medium text-center px-6"
              >
                Không tìm thấy loại ngày phép có lương khả dụng
              </Typography>
            </div>
          ) : (
            <div className="grid gap-2">
              {paidLeaveTypes.map((type) => {
                const alreadyHas = isAlreadyInitialized(type.id);
                const isProcessed = processedTypes.includes(type.id);
                const isDisabled =
                  (isPending || alreadyHas || isProcessed) && !shouldReset;

                return (
                  <Button
                    key={type.id}
                    variant="outline"
                    disabled={isDisabled}
                    onClick={() => handleInit(type.id)}
                    className={cn(
                      "h-14 justify-between px-4 rounded-xl border-slate-200 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group",
                      (isProcessed || (alreadyHas && !shouldReset)) &&
                        "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 opacity-80",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isProcessed || (alreadyHas && !shouldReset)
                            ? "bg-emerald-100/80"
                            : "bg-slate-100 group-hover:bg-primary/10",
                        )}
                      >
                        {isProcessed || (alreadyHas && !shouldReset) ? (
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                        ) : (
                          <CalendarDays
                            size={16}
                            strokeWidth={2.5}
                            className="text-slate-500 group-hover:text-primary"
                          />
                        )}
                      </div>
                      <span className="font-semibold text-sm">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Loader2
                          size={16}
                          className="animate-spin opacity-40"
                        />
                      )}
                      {!isProcessed && !alreadyHas && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-primary/40 transition-colors" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600 rounded-xl"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
