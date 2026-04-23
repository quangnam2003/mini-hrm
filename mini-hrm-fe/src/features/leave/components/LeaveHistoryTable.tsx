"use client";

import { OverflowTooltip } from "@/components/common/form/OverflowTooltip";
import { format } from "date-fns";
import { DataTable } from "@/components/common/table/DataTable";
import { TablePagination } from "@/components/common/table/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Timer,
  XCircle,
} from "lucide-react";
import React from "react";
import { LeaveRequest, LeaveStatus } from "../types";

interface LeaveHistoryTableProps {
  data: LeaveRequest[];
  pagination: {
    currentPage: number;
    totalPage: number;
    totalItems: number;
    perPage: number;
  };
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewDetail: (request: LeaveRequest) => void;
}

const statusMap: Record<
  LeaveStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "primary"
      | "warning"
      | "success";
    icon: React.ElementType;
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

export function LeaveHistoryTable({
  data,
  pagination,
  onPageChange,
  onPerPageChange,
  onViewDetail,
}: LeaveHistoryTableProps) {
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: "leave_type.name",
      header: "Loại nghỉ phép",
      cell: ({ row }) => (
        <Typography variant="small" className="font-semibold text-slate-700">
          {row.original.leave_type.name}
        </Typography>
      ),
    },
    {
      accessorKey: "request_scope",
      header: "Hình thức",
      cell: ({ row }) => {
        const scope =
          scopeMap[row.original.request_scope] || row.original.request_scope;
        const period =
          row.original.half_day_period === "morning"
            ? " (Sáng)"
            : row.original.half_day_period === "afternoon"
              ? " (Chiều)"
              : "";
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="font-medium bg-slate-50 border-slate-200"
            >
              {scope}
              {period}
            </Badge>
          </div>
        );
      },
    },
    {
      header: "Thời gian",
      cell: ({ row }) => {
        const isHourly = row.original.request_scope === "hourly";
        const start = format(row.original.start_time, "dd/MM/yyyy");
        const end = format(row.original.end_time, "dd/MM/yyyy");

        return (
          <div className="flex flex-col gap-1 py-1">
            <div className="flex items-center gap-2 group">
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {isHourly ? (
                  <Timer size={12} className="text-blue-500" />
                ) : (
                  <Calendar size={12} className="text-blue-500" />
                )}
                <span className="text-[11px] font-medium leading-none">
                  {start}
                </span>
              </div>
              <ArrowRight size={10} className="text-slate-300" />
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {isHourly ? (
                  <Timer size={12} className="text-blue-500" />
                ) : (
                  <Calendar size={12} className="text-blue-500" />
                )}
                <span className="text-[11px] font-medium leading-none">
                  {end}
                </span>
              </div>
            </div>
            <Typography
              variant="small"
              className="text-[10px] text-muted-foreground font-medium ml-1"
            >
              Tổng cộng:{" "}
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
      accessorKey: "reason",
      header: "Lý do",
      cell: ({ row }) => (
        <div className="max-w-[220px]">
          <OverflowTooltip text={row.original.reason} />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const rawStatus = row.original.status;
        const status = (statusMap as any)[rawStatus] || statusMap.rejected;
        const StatusIcon = status.icon;
        return (
          <div className="flex items-center justify-between min-w-[130px]">
            <Badge
              className={cn(
                "gap-1.5 font-bold shadow-sm px-2 py-0.5",
                status.variant === "warning" &&
                  "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                status.variant === "success" &&
                  "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                status.variant === "destructive" &&
                  "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
                status.variant === "secondary" &&
                  "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
              )}
            >
              <StatusIcon size={12} strokeWidth={3} />
              {status.label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-blue-600 shrink-0 ml-2"
              onClick={() => onViewDetail(row.original)}
            >
              <Eye size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        emptyStateText="Chưa có lịch sử nghỉ phép"
      />
      {data.length > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPage={pagination.totalPage}
          totalItems={pagination.totalItems}
          perPage={pagination.perPage}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </div>
  );
}
