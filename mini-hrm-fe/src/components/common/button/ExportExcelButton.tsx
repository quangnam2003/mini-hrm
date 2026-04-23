"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ExcelColumn } from "@/types/common";
import ExcelJS from "exceljs";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ExportExcelButtonProps<T> {
  columns: ExcelColumn<T>[];
  fileName?: string;
  sheetName?: string;
  disabled?: boolean;
  getCurrentData: () => T[] | Promise<T[]>;
  getAllData: () => T[] | Promise<T[]>;
}

export function ExportExcelButton<T>({
  columns,
  fileName = "export",
  sheetName = "Sheet 1",
  disabled = false,
  getCurrentData,
  getAllData,
}: ExportExcelButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = useCallback(
    async (data: T[], suffix: string) => {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Mini HRM";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 20,
      }));

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 25;

      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      data.forEach((row, index) => {
        const rowData: Record<string, any> = {};
        columns.forEach((col) => {
          rowData[col.key] = col.render
            ? col.render(row)
            : (row as any)[col.key];
        });
        const addedRow = worksheet.addRow(rowData);

        if (index % 2 === 1) {
          addedRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }

        addedRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
          cell.alignment = { vertical: "middle", wrapText: true };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}${suffix}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    [columns, fileName, sheetName],
  );

  const handleExport = async (
    fetcher: () => T[] | Promise<T[]>,
    suffix: string,
  ) => {
    try {
      setIsExporting(true);
      const data = await fetcher();

      if (!data || data.length === 0) {
        toast.error("Không có dữ liệu để xuất");
        return;
      }

      await exportToExcel(data, suffix);
      toast.success(`Xuất ${data.length} bản ghi thành công`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative group inline-block">
      <Button
        variant="secondary"
        size="sm"
        className="h-9 gap-2 text-xs border-dashed border-black/40 hover:bg-slate-50 transition-colors shadow-sm"
        disabled={disabled || isExporting}
      >
        {isExporting ? (
          <Loader2 size={14} className="animate-spin text-primary" />
        ) : (
          <Download size={14} className="text-primary" />
        )}
        <Typography
          variant="small"
          as="span"
          className="text-xs text-foreground"
        >
          Xuất Excel
        </Typography>
        <ChevronDown
          size={12}
          className="text-muted-foreground group-hover:rotate-180 transition-transform duration-200"
        />
      </Button>

      <div className="absolute top-full right-0 pt-1.5 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 z-50">
        <div className="bg-white border border-black/10 shadow-lg rounded-xl p-1.5 min-w-[220px]">
          <Button
            variant="ghost"
            onClick={() => handleExport(getCurrentData, "_Bo_Loc")}
            disabled={disabled || isExporting}
            className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Filter size={14} className="text-primary shrink-0" />
            <div className="text-left">
              <Typography
                variant="small"
                as="span"
                className="text-xs font-medium text-foreground block"
              >
                Tải theo bộ lọc
              </Typography>
              <Typography variant="tiny" as="span" className="block mt-0.5">
                Xuất dữ liệu trang hiện tại
              </Typography>
            </div>
          </Button>

          <div className="h-px bg-border/50 mx-2 my-0.5" />

          <Button
            variant="ghost"
            onClick={() => handleExport(getAllData, "_Toan_Bo")}
            disabled={disabled || isExporting}
            className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
            <div className="text-left">
              <Typography
                variant="small"
                as="span"
                className="text-xs font-medium text-foreground block"
              >
                Tải toàn bộ
              </Typography>
              <Typography variant="tiny" as="span" className="block mt-0.5">
                Xuất tất cả dữ liệu
              </Typography>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
