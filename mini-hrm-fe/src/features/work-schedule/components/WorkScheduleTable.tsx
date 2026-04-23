import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Clock, Pencil, UserCheck, UserX } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/common/table/DataTable";
import { ToggleButton } from "@/components/common/form/ToggleButton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { RuleWorkSetting } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface WorkScheduleTableProps {
  data: RuleWorkSetting[];
  onEdit: (item: RuleWorkSetting) => void;
  onToggleActive: (item: RuleWorkSetting) => void;
}

export function WorkScheduleTable({
  data,
  onEdit,
  onToggleActive,
}: WorkScheduleTableProps) {
  const columns = useMemo<ColumnDef<RuleWorkSetting>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên cấu hình",
        cell: ({ row }) => (
          <div className="flex flex-col py-1">
            <Typography
              variant="p"
              className="text-[13px] font-bold text-slate-800"
            >
              {row.original.name}
            </Typography>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  row.original.is_active ? "bg-emerald-500" : "bg-slate-300",
                )}
              />
              <Typography
                variant="small"
                className="text-[11px] text-slate-500"
              >
                {row.original.is_active ? "Đang áp dụng" : "Đã dừng"}
              </Typography>
            </div>
          </div>
        ),
      },
      {
        id: "hours",
        header: "Giờ làm việc",
        cell: ({ row }) => {
          const shift = row.original.setting.shifts.office_hours;
          return (
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                  {shift.work_start} - {shift.work_end}
                </div>
              </div>
              <Typography
                variant="small"
                className="text-[11px] text-slate-400"
              >
                Nghỉ trưa: {shift.break_start} - {shift.break_end}
              </Typography>
            </div>
          );
        },
      },
      {
        id: "saturday",
        header: "Làm thứ 7",
        cell: ({ row }) => {
          const config = row.original.setting.saturday_config;
          const labelMap = {
            none: "Nghỉ tất cả thứ 7",
            bi_weekly: "Làm cách tuần",
            every_week: "Làm tất cả thứ 7",
          };
          return (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium",
                config.type === "none"
                  ? "bg-slate-50 text-slate-500 border-slate-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200",
              )}
            >
              {labelMap[config.type]}
            </span>
          );
        },
      },
      {
        id: "applicability",
        header: "Thời gian áp dụng",
        cell: ({ row }) => {
          const { apply_from, apply_to } = row.original;
          if (!apply_from)
            return (
              <Typography variant="small" className="text-xs text-slate-400">
                Vĩnh viễn
              </Typography>
            );

          const from = format(new Date(apply_from), "dd/MM/yyyy", {
            locale: vi,
          });
          const to = apply_to
            ? format(new Date(apply_to), "dd/MM/yyyy", { locale: vi })
            : "Nay";

          return (
            <Typography
              variant="small"
              className="text-xs text-slate-600 font-medium tabular-nums"
            >
              {from} - {to}
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
              className="h-8 w-8 p-0 text-muted-foreground border-none hover:text-primary shadow-none transition-all"
              onClick={() => onEdit(row.original)}
            >
              <Pencil size={13} />
            </Button>

            <ToggleButton
              checked={row.original.is_active}
              onCheckedChange={() =>
                !row.original.is_active && onToggleActive(row.original)
              }
              title={row.original.is_active ? "Đang áp dụng" : "Kích hoạt"}
              disabled={row.original.is_active}
            />
          </div>
        ),
      },
    ],
    [onEdit, onToggleActive],
  );

  return (
    <DataTable
      columns={columns}
      data={data || []}
      emptyStateText="Chưa có cấu hình làm việc nào"
    />
  );
}
