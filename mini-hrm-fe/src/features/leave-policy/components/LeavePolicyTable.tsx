import { ToggleButton } from "@/components/common/form/ToggleButton";
import { DataTable } from "@/components/common/table/DataTable";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { LeaveType } from "../types";
import { format } from "date-fns";

interface LeavePolicyTableProps {
  data: LeaveType[];
  onEdit: (data: LeaveType) => void;
  onDelete: (id: number) => void;
  onToggleActive: (data: LeaveType) => void;
  isLoading?: boolean;
}

export function LeavePolicyTable({
  data,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading,
}: LeavePolicyTableProps) {
  const columns = useMemo<ColumnDef<LeaveType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên loại nghỉ phép",
        cell: ({ row }) => (
          <Typography
            variant="p"
            className="text-[13px] font-semibold text-slate-800"
          >
            {row.original.name}
          </Typography>
        ),
      },
      {
        accessorKey: "is_paid",
        header: "Lương",
        cell: ({ row }) => {
          const isPaid = row.original.is_paid === 1;
          return (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider",
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-50 text-slate-500 border-slate-100",
              )}
            >
              {isPaid ? "Có lương" : "Không lương"}
            </span>
          );
        },
      },
      {
        accessorKey: "default_days",
        header: "Mặc định (ngày)",
        cell: ({ row }) => (
          <Typography
            variant="small"
            className="text-[13px] font-medium tabular-nums text-slate-600"
          >
            {row.original.default_days}
          </Typography>
        ),
      },
      {
        accessorKey: "allow_half_day",
        header: "Nửa ngày",
        cell: ({ row }) => {
          const enabled = row.original.allow_half_day === 1;
          return (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider",
                enabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-50 text-slate-400 border-slate-100",
              )}
            >
              {enabled ? "Có" : "Không"}
            </span>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isActive = row.original.is_active === 1;
          return (
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold",
                isActive
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              {isActive ? "Hoạt động" : "Vô hiệu hóa"}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Ngày tạo",
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const isValidDate = !isNaN(date.getTime());
          return (
            <Typography
              variant="small"
              className="text-xs tabular-nums text-muted-foreground"
            >
              {isValidDate ? format(date, "dd/MM/yyyy") : "Chưa cập nhật"}
            </Typography>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-3 pr-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-none hover:text-primary hover:bg-primary/5 transition-all shadow-none"
              onClick={() => onEdit(row.original)}
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-none hover:text-rose-600 hover:bg-rose-50 transition-all shadow-none"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 size={13} />
            </Button>

            <ToggleButton
              checked={row.original.is_active === 1}
              onCheckedChange={() => onToggleActive(row.original)}
              title={row.original.is_active === 1 ? "Vô hiệu hóa" : "Kích hoạt"}
            />
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onToggleActive],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyStateText="Không tìm thấy loại nghỉ phép nào"
      className="border-none shadow-none"
    />
  );
}
