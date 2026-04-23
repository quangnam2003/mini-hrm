"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyStateText?: string;
  className?: string;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  enableRowSelection?: ((row: any) => boolean) | boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyStateText = "Không có dữ liệu",
  className,
  rowSelection = {},
  onRowSelectionChange,
  enableRowSelection,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: onRowSelectionChange,
    enableRowSelection: enableRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl bg-white flex flex-col items-center justify-center py-16 gap-2",
          className,
        )}
      >
        <Users
          size={36}
          strokeWidth={1.2}
          className="text-muted-foreground/30"
        />
        <Typography variant="small" className="text-sm text-muted-foreground">
          {emptyStateText}
        </Typography>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md",
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-slate-50/80 hover:bg-slate-50/80 border-b-slate-200/80"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-11 px-4"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn(
                        "flex items-center",
                        (header.id === "select" || header.id === "actions") &&
                          "justify-center",
                      )}
                    >
                      <Typography
                        variant="label"
                        className="text-[12px] text-slate-500 font-bold tracking-wider"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </Typography>
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-slate-50/30 transition-colors border-b-slate-100/80 last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-3",
                      (cell.column.id === "select" ||
                        cell.column.id === "actions") &&
                        "text-center",
                    )}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center ">
                <Typography variant="small">Không có kết quả.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
