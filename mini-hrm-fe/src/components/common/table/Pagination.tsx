"use client";

import { useMemo } from "react";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Typography } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PER_PAGE_OPTIONS = [5, 10, 20] as const;

interface TablePaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (size: number) => void;
  totalItems?: number;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPage,
  onPageChange,
  perPage,
  onPerPageChange,
  totalItems,
  className,
}: TablePaginationProps) {
  if (totalPage <= 0) return null;

  const pages = useMemo(() => {
    const result: (number | "start" | "end")[] = [];
    const maxVisible = 5;

    if (totalPage <= maxVisible) {
      for (let i = 1; i <= totalPage; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("start");

      const from = Math.max(2, currentPage - 1);
      const to = Math.min(totalPage - 1, currentPage + 1);
      for (let i = from; i <= to; i++) result.push(i);

      if (currentPage < totalPage - 2) result.push("end");
      if (result[result.length - 1] !== totalPage) result.push(totalPage);
    }

    return result;
  }, [currentPage, totalPage]);

  const showPerPage = !!onPerPageChange && !!perPage;

  const rangeFrom = totalItems
    ? Math.min((currentPage - 1) * (perPage ?? 10) + 1, totalItems)
    : null;
  const rangeTo = totalItems
    ? Math.min(currentPage * (perPage ?? 10), totalItems)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-end gap-3 mt-4",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {showPerPage && (
          <div className="flex items-center gap-2">
            <Typography variant="small" as="span" className="text-xs">
              Hiển thị
            </Typography>
            <Select
              value={String(perPage)}
              onValueChange={(v) => onPerPageChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[65px] text-xs rounded-lg border-black/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Typography variant="small" as="span" className="text-xs">
              / trang
            </Typography>
          </div>
        )}

        {totalItems != null && rangeFrom != null && rangeTo != null && (
          <Typography variant="small" as="span" className="text-xs">
            {rangeFrom}–{rangeTo} trên{" "}
            <Typography
              variant="small"
              as="span"
              className="text-xs font-semibold text-foreground"
            >
              {totalItems}
            </Typography>{" "}
            kết quả
          </Typography>
        )}
      </div>

      {totalPage > 1 && (
        <ShadcnPagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={cn(
                  currentPage <= 1 && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>

            {pages.map((page) =>
              typeof page === "string" ? (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPage) onPageChange(currentPage + 1);
                }}
                className={cn(
                  currentPage >= totalPage && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </ShadcnPagination>
      )}
    </div>
  );
}
