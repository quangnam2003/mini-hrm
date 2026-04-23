"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search01Icon, UserGroupIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { UserAPIResponse } from "../types/permission";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { useDebounce } from "@/hooks/use-debounce";
import { mapEmployeeToUserResponse } from "../adapters/permission";
import { Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/common/avatar/user-avatar";

const INITIAL_LIMIT = 6;


interface EmployeePopoverProps {
  selectedEmployees: UserAPIResponse[];
  onSelect: (employee: UserAPIResponse) => void;
  isOpen: boolean;
  onClose: () => void;
}

function PopoverContent({
  selectedEmployees,
  searchQuery,
  setSearchQuery,
  availableEmployees,
  isLoading,
  hasMore,
  onLoadMore,
  handleSelect,
  onClose,
}: {
  selectedEmployees: UserAPIResponse[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  availableEmployees: UserAPIResponse[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  handleSelect: (emp: UserAPIResponse) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col bg-surface">
      {/* Header */}
      <div className="px-3 pb-1.5 pt-3">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-primary" strokeWidth={2.5} />
          <Typography variant="label-sm" className="text-sm leading-none">
            Thêm nhân viên phân quyền
          </Typography>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-2.5 py-1.5">
        <div className="relative group">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle-text group-focus-within:text-primary transition-colors"
            strokeWidth={2}
          />
          <Input
            placeholder="Tìm nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-page border-line focus-visible:ring-primary/10 focus-visible:border-primary rounded-lg text-xs transition-all placeholder:text-subtle-text/70 shadow-none"
            autoFocus
          />
          {isLoading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="px-1 py-0.5 max-h-[220px] overflow-y-auto no-scrollbar flex flex-col">
        {isLoading && availableEmployees.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary/40 mb-2" />
            <Typography variant="tiny" className="text-muted">Đang tải...</Typography>
          </div>
        ) : availableEmployees.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <HugeiconsIcon icon={UserGroupIcon} className="w-7 h-7 text-subtle-text/20 mb-1.5" strokeWidth={1} />
            {hasMore ? (
              <>
                <Typography variant="label-xs" className="font-medium text-muted">
                  Tất cả nhân viên đã được chọn
                </Typography>
                <Typography variant="tiny" className="text-subtle-text/60 mt-0.5">
                  Ấn &quot;Xem thêm&quot; để tải thêm nhân viên
                </Typography>
              </>
            ) : (
              <Typography variant="label-xs" className="font-medium text-muted">
                Không còn nhân viên nào để thêm
              </Typography>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {availableEmployees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => handleSelect(employee)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-page transition-all text-left group border border-transparent active:scale-[0.98] origin-left"
              >
                <UserAvatar
                  name={employee.name}
                  avatar={employee.avatar}
                  id={employee.id}
                  shortName={employee.shortName}
                />
                <div className="flex-1 min-w-0">
                  <Typography variant="label-xs" className="text-sm group-hover:text-primary transition-colors truncate leading-tight block">
                    {employee.name}
                  </Typography>
                  <Typography variant="tiny" className="text-muted truncate leading-tight block font-normal">
                    {employee.empCode || employee.id} · {employee.email}
                  </Typography>
                </div>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-subtle-text group-hover:text-primary group-hover:bg-primary-tint opacity-0 group-hover:opacity-100 transition-all">
                  <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
              </button>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="pt-2 pb-1 px-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full h-8 text-[11px] font-semibold border-line bg-page hover:bg-subtle/10 hover:border-primary/30 text-muted hover:text-primary transition-all rounded-lg gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Xem thêm"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2.5 py-1.5 bg-page border-t border-line flex items-center justify-between">
        <Typography variant="tiny" className="font-medium text-muted">
          Đang chọn {selectedEmployees.length} nhân viên
        </Typography>
      </div>
    </div>
  );
}


export function EmployeePopover({
  selectedEmployees,
  onSelect,
  isOpen,
  onClose,
}: EmployeePopoverProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const preSelectedCountRef = useRef(0);
  useEffect(() => {
    if (isOpen) {
      preSelectedCountRef.current = selectedEmployees.length;
      setLimit(INITIAL_LIMIT);
    }
  }, [isOpen]); 
  
  // Reset limit when search query changes
  useEffect(() => {
    setLimit(INITIAL_LIMIT);
  }, [debouncedSearch]);

  const { listQueryEmployee } = useEmployees({
    name: debouncedSearch || undefined,
    per_page: limit + preSelectedCountRef.current,
    role: "employee",
  });

  const total = listQueryEmployee.data?.meta?.total || 0;
  const hasMore = total > limit + preSelectedCountRef.current;

  const availableEmployees = useMemo(() => {
    const employees = listQueryEmployee.data?.data || [];
    return employees
      .map(mapEmployeeToUserResponse)
      .filter((emp) => !selectedEmployees.some((s) => s.id === emp.id));
  }, [listQueryEmployee.data, selectedEmployees]);

  const handleSelect = (employee: UserAPIResponse) => {
    onSelect(employee);
    setSearchQuery("");
  };

  const handleLoadMore = () => {
    setLimit(prev => prev + INITIAL_LIMIT);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mobile: fixed, centered on screen with backdrop
  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
        <div
          ref={containerRef}
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-surface rounded-xl shadow-2xl border border-line overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <PopoverContent
            selectedEmployees={selectedEmployees}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            availableEmployees={availableEmployees}
            isLoading={listQueryEmployee.isFetching}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            handleSelect={handleSelect}
            onClose={onClose}
          />
        </div>
      </>
    );
  }

  // Desktop: absolute, below button
  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-1.5 w-[280px] bg-surface rounded-xl shadow-2xl border border-line z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <PopoverContent
        selectedEmployees={selectedEmployees}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        availableEmployees={availableEmployees}
        isLoading={listQueryEmployee.isFetching}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        handleSelect={handleSelect}
        onClose={onClose}
      />
      {/* Arrow */}
      <div className="absolute right-[10px] top-[-6px] w-3 h-3 bg-surface border-l border-t border-line rotate-45" />
    </div>
  );
}
