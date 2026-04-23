"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Timer,
  User,
  Eye,
} from "lucide-react";
import { DataTable } from "@/components/common/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { LeaveRequest, LeaveStatus } from "../types";
import { OverflowTooltip } from "@/components/common/form/OverflowTooltip";
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

interface AdminLeaveTableProps {
  data: LeaveRequest[];
  onAction: (request: LeaveRequest) => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (selection: any) => void;
}

const statusMap: Record<
  LeaveStatus,
  {
    label: string;
    variant: string;
    icon: any;
  }
> = {
  pending: { label: "Chờ duyệt", variant: "warning", icon: Clock },
  approved: { label: "Đã duyệt", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Từ chối", variant: "destructive", icon: XCircle },
};

const scopeMap: Record<string, string> = {
  full_day: "Cả ngày",
  half_day: "Nửa ngày",
  hourly: "Theo giờ",
};

export function AdminLeaveTable({
  data,
  onAction,
  rowSelection,
  onRowSelectionChange,
}: AdminLeaveTableProps) {
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      id: "select",
      header: ({ table }) => {
        const isAllSelected = table.getIsAllPageRowsSelected();
        const selectableRows = table
          .getRowModel()
          .rows.filter((row) => row.getCanSelect());
        const isSomeSelected =
          selectableRows.length > 0 &&
          selectableRows.some((row) => row.getIsSelected());

        return (selectableRows.length > 0 ? (
          <Checkbox
            checked={isAllSelected}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ) : null);
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          disabled={!row.getCanSelect()}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user.name",
      header: "Nhân viên",
      cell: ({ row }) => {
        const user = row.original.user;
        const initials = getInitials(user?.name || "");
        const avatarColor = user
          ? AVATAR_COLORS[user.id % AVATAR_COLORS.length]
          : "bg-slate-100";

        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 overflow-hidden shadow-sm",
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
                initials || <User size={14} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <Typography
                variant="small"
                className="font-medium text-slate-900 leading-none truncate block text-[13px]"
              >
                {user?.name}
              </Typography>
              <Typography
                variant="label"
                className="text-[10px] text-muted-foreground mt-1 block"
              >
                {user?.empCode}
              </Typography>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "leave_type.name",
      header: "Loại nghỉ",
      cell: ({ row }) => (
        <Typography variant="small" className="font-medium text-slate-700">
          {row.original.leave_type.name}
        </Typography>
      ),
    },
    {
      header: "Thời gian",
      cell: ({ row }) => {
        const isHourly = row.original.request_scope === "hourly";
        const start = format(row.original.start_time, "dd/MM/yyyy");
        const end = format(row.original.end_time, "dd/MM/yyyy");

        return (
          <div className="flex flex-col gap-1 py-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                {isHourly ? (
                  <Timer size={10} className="text-blue-500" />
                ) : (
                  <Calendar size={10} className="text-blue-500" />
                )}
                {start}
              </div>
              {!isHourly && start !== end && (
                <>
                  <span className="text-slate-300">→</span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    <Calendar size={10} className="text-blue-500" />
                    {end}
                  </div>
                </>
              )}
            </div>
            <Typography
              variant="label"
              className="text-[10px] text-muted-foreground ml-1"
            >
              Tổng:{" "}
              <span className="text-slate-900 font-bold">
                {row.original.total_amount}{" "}
                {row.original.amount_unit === "days" ? "ngày" : "giờ"}
              </span>
            </Typography>
          </div>
        );
      },
    },
    {
      header: "Hình thức",
      cell: ({ row }) => {
        const scope = scopeMap[row.original.request_scope];
        const period =
          row.original.half_day_period === "morning"
            ? " (Sáng)"
            : row.original.half_day_period === "afternoon"
              ? " (Chiều)"
              : "";
        return (
          <Badge
            variant="outline"
            className="font-medium bg-white text-slate-600 border-slate-200"
          >
            {scope}
            {period}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Lý do",
      cell: ({ row }) => (
        <div className="max-w-[150px]">
          <OverflowTooltip text={row.original.reason} />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const rawStatus = row.original.status;
        const status = statusMap[rawStatus] || statusMap.rejected;
        const StatusIcon = status.icon;

        return (
          <Badge
            variant={status.variant as any}
            className={cn(
              "gap-1.5 font-bold shadow-sm px-2 py-0.5",
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
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/5"
              onClick={() => onAction(row.original)}
              title="Xem chi tiết"
            >
              <Eye size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      enableRowSelection={(row) => row.original.status === "pending"}
      emptyStateText="Không có yêu cầu nghỉ phép nào cần xử lý"
    />
  );
}
