"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useLeave } from "../hooks/use-leave";
import { LeaveRequest } from "../types";

interface LeaveDetailDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelSuccess?: () => void;
}

const statusMap = {
  pending: { label: "Chờ duyệt", variant: "warning", icon: Clock },
  approved: { label: "Đã duyệt", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
  cancelled: { label: "Đã hủy", variant: "secondary", icon: AlertCircle },
};

const scopeMap = {
  full_day: "Cả ngày",
  half_day: "Nửa ngày",
  hourly: "Theo giờ",
};

export function LeaveDetailDialog({
  request,
  open,
  onOpenChange,
  onCancelSuccess,
}: LeaveDetailDialogProps) {
  const { cancelLeave, isCancelling } = useLeave();

  if (!request) return null;

  const status = statusMap[request.status] || statusMap.pending;
  const StatusIcon = status.icon;

  const handleCancel = () => {
    cancelLeave(request.id, {
      onSuccess: () => {
        onOpenChange(false);
        if (onCancelSuccess) onCancelSuccess();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <div className="bg-primary/5 p-6 pb-4 border-b border-primary/10">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-white text-[11px] tracking-wide font-bold text-primary border-primary/20"
              >
                Chi tiết đơn
              </Badge>
              <Badge
                variant={status.variant as any}
                className={cn(
                  "gap-1.5 font-bold shadow-sm",
                  status.variant === "warning" &&
                    "bg-amber-50 text-amber-700 border-amber-200",
                  status.variant === "success" &&
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
                  status.variant === "destructive" &&
                    "bg-rose-50 text-rose-700 border-rose-200",
                  status.variant === "secondary" &&
                    "bg-slate-100 text-slate-700 border-slate-200",
                )}
              >
                <StatusIcon size={12} strokeWidth={3} />
                {status.label}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 pt-2">
              {request.leave_type?.name || "Chi tiết đơn"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Typography
                variant="label"
                className="text-[12px] text-slate-500 font-semibold tracking-tight"
              >
                Hình thức
              </Typography>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 font-medium"
                >
                  {scopeMap[request.request_scope]}
                  {request.half_day_period === "morning" && " (Sáng)"}
                  {request.half_day_period === "afternoon" && " (Chiều)"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              <Typography
                variant="label"
                className="text-[12px] text-slate-500 font-semibold tracking-tight"
              >
                Tổng cộng
              </Typography>
              <div className="text-sm font-bold text-slate-800">
                {request.total_amount}{" "}
                {request.amount_unit === "days" ? "ngày" : "giờ"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Typography
              variant="label"
              className="text-[12px] text-slate-500 font-semibold tracking-tight"
            >
              Thời gian nghỉ
            </Typography>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    Từ ngày
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {format(request.start_time, "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-300" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    Đến ngày
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {format(request.end_time, "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Typography
              variant="label"
              className="text-[12px] text-slate-500 font-semibold tracking-tight flex items-center gap-1.5"
            >
              <MessageSquare size={12} className="text-slate-400" /> Lý do xin
              nghỉ
            </Typography>
            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
              "{request.reason}"
            </div>
          </div>

          {request.approver_note && (
            <div className="space-y-2 p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
              <Typography
                variant="label"
                className="text-[12px] text-rose-600 font-semibold tracking-tight flex items-center gap-1.5"
              >
                <AlertCircle size={12} className="text-rose-400" /> Phản hồi từ
                quản lý
              </Typography>
              <div className="text-sm text-rose-700 font-medium">
                {request.approver_note}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100">
          <Button
            variant="outline"
            className="flex-1 rounded-lg border-slate-200"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          {request.status === "pending" && (
            <Button
              variant="destructive"
              className="flex-1 rounded-lg shadow-sm"
              onClick={handleCancel}
              isLoading={isCancelling}
            >
              Hủy đơn
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
