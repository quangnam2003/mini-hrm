import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { leaveActionSchema, LeaveActionFormValues } from "../schemas/admin";
import { LeaveRequest } from "../types";
import { TextareaFieldInput } from "@/components/common/form/TextareaFieldInput";
import { Typography } from "@/components/ui/typography";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Timer,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { AVATAR_COLORS } from "@/features/employee/constants";

function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface LeaveActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest | null;
  onSubmit: (
    values: LeaveActionFormValues & { status: "approved" | "rejected" },
  ) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const scopeMap: Record<string, string> = {
  full_day: "Cả ngày",
  half_day: "Nửa ngày",
  hourly: "Theo giờ",
};

const statusMap = {
  pending: { label: "Chờ duyệt", variant: "warning", icon: Clock },
  approved: { label: "Đã duyệt", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
};

export function LeaveActionDialog({
  open,
  onOpenChange,
  request,
  onSubmit,
  isLoading,
  title,
  description,
}: LeaveActionDialogProps) {
  const form = useForm<LeaveActionFormValues>({
    resolver: zodResolver(leaveActionSchema),
    defaultValues: {
      approver_note: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        approver_note: request?.approver_note || "",
      });
    }
  }, [open, request, form]);

  const handleSubmit = (status: "approved" | "rejected") => {
    const values = form.getValues();
    onSubmit({ ...values, status });
  };

  const isBulk = !request;
  const isPending = request?.status === "pending";
  const statusInfo = request
    ? statusMap[request.status] || statusMap.pending
    : null;
  const StatusIcon = statusInfo?.icon;

  const user = request?.user;
  const initials = getInitials(user?.name || "");
  const avatarColor = user
    ? AVATAR_COLORS[user.id % AVATAR_COLORS.length]
    : "bg-slate-100";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden rounded-xl border-none shadow-2xl",
          isBulk ? "sm:max-w-[425px]" : "sm:max-w-[500px]",
        )}
      >
        <div className="bg-primary/5 p-6 pb-4 border-b border-primary/10">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-white text-[11px] tracking-wide font-bold text-primary border-primary/20"
              >
                {isBulk ? "Thao tác hàng loạt" : "Chi tiết đơn"}
              </Badge>
              {!isBulk && statusInfo && (
                <Badge
                  variant={statusInfo.variant as any}
                  className={cn(
                    "gap-1.5 font-bold shadow-sm",
                    statusInfo.variant === "warning" &&
                      "bg-amber-50 text-amber-700 border-amber-200",
                    statusInfo.variant === "success" &&
                      "bg-emerald-50 text-emerald-700 border-emerald-200",
                    statusInfo.variant === "destructive" &&
                      "bg-rose-50 text-rose-700 border-rose-200",
                  )}
                >
                  {StatusIcon && <StatusIcon size={12} strokeWidth={3} />}
                  {statusInfo.label}
                </Badge>
              )}
              {isBulk && (
                <Badge className="gap-1.5 font-bold shadow-sm bg-amber-50 text-amber-700 border-amber-200">
                  <Clock size={12} strokeWidth={3} />
                  Chờ duyệt
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 pt-2">
              {isBulk ? title : request.leave_type?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {isBulk
                ? description
                : "Xem chi tiết thông tin và phản hồi yêu cầu nghỉ phép của nhân viên."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
          {!isBulk && (
            <>
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden shadow-sm ring-2 ring-white",
                    !user?.avatar && avatarColor,
                  )}
                >
                  {user?.avatar ? (
                    <img
                      src={
                        user.avatar.startsWith("http")
                          ? user.avatar
                          : `${process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8000/storage/"}${user.avatar}`
                      }
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || <User size={18} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Typography
                    variant="small"
                    className="font-medium text-slate-900 leading-none truncate block text-base"
                  >
                    {user?.name}
                  </Typography>
                  <Typography
                    variant="label"
                    className="text-[12px] text-muted-foreground mt-1.5 block font-medium"
                  >
                    Mã NV:{" "}
                    <span className="text-slate-700 font-bold">
                      {user?.empCode}
                    </span>
                  </Typography>
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <Typography
                    variant="label"
                    className="text-[12px] text-slate-500 font-semibold tracking-wider"
                  >
                    Hình thức
                  </Typography>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 font-medium"
                  >
                    {scopeMap[request.request_scope]}
                    {request.half_day_period === "morning" && " (Sáng)"}
                    {request.half_day_period === "afternoon" && " (Chiều)"}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <Typography
                    variant="label"
                    className="text-[12px] text-slate-500 font-semibold tracking-wider"
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
                  className="text-[12px] text-slate-500 font-semibold tracking-wider"
                >
                  Thời gian nghỉ
                </Typography>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      <span className="text-xs text-slate-600 font-medium">
                        Bắt đầu:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {format(new Date(request.start_time), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-600 font-medium">
                        Kết thúc:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {format(new Date(request.end_time), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Typography
                  variant="label"
                  className="text-[12px] text-slate-500 font-semibold tracking-wider"
                >
                  Lý do xin nghỉ
                </Typography>
                <div className="text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                  "{request.reason}"
                </div>
              </div>
            </>
          )}

          <Form {...form}>
            <form className="space-y-4">
              <TextareaFieldInput
                name="approver_note"
                label={
                  isBulk ? "Ghi chú phê duyệt hàng loạt" : "Ghi chú phản hồi"
                }
                placeholder={
                  isPending
                    ? "Nhập ghi chú phê duyệt hoặc lý do từ chối..."
                    : "Không có ghi chú"
                }
                className="bg-white"
                readOnly={!isPending && !isBulk}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl h-11 border-slate-200"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Đóng
          </Button>
          {!isBulk ? (
            isPending && (
              <div className="flex-[2] flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1 rounded-xl h-11 gap-1.5"
                  onClick={() => handleSubmit("rejected")}
                  isLoading={isLoading}
                >
                  Từ chối
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 gap-1.5 transition-all shadow-lg shadow-emerald-200"
                  onClick={() => handleSubmit("approved")}
                  isLoading={isLoading}
                >
                  Phê duyệt
                </Button>
              </div>
            )
          ) : (
            <Button
              type="button"
              variant={title?.includes("Từ chối") ? "destructive" : "default"}
              className={cn(
                "flex-1 rounded-xl h-11",
                !title?.includes("Từ chối") &&
                  "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
              )}
              onClick={() =>
                handleSubmit(
                  title?.includes("Từ chối") ? "rejected" : "approved",
                )
              }
              isLoading={isLoading}
            >
              Xác nhận {title?.includes("Từ chối") ? "từ chối" : "phê duyệt"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
