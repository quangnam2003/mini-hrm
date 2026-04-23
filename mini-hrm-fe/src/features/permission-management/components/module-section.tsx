"use client";

import { useState } from "react";
import { ModuleAPIResponse, UserAPIResponse } from "../types/permission";
import { PermissionRow } from "./permission-row";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModuleSectionProps {
  module: ModuleAPIResponse;
  onAddEmployee: (permissionId: string, employee: UserAPIResponse) => void;
  onRemoveEmployee: (permissionId: string, employeeId: string) => void;
}

export function ModuleSection({
  module,
  onAddEmployee,
  onRemoveEmployee,
}: ModuleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="border border-line rounded-xl bg-surface shadow-sm transition-all duration-200 overflow-visible">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-6 py-4 bg-surface hover:bg-page transition-colors duration-150 rounded-t-xl",
          !isExpanded && "rounded-b-xl"
        )}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted" />
          )}
          <Typography variant="label-sm" className="text-primary uppercase tracking-widest leading-none">
            {module.name}
          </Typography>
        </div>
      </button>

      {/* Column Headers - Hidden on mobile */}
      {isExpanded && !isMobile && (
        <div className="flex items-stretch bg-page/50 border-t border-b border-line">
          <div className="w-1/2 flex items-center gap-2 px-6 py-3 border-r border-line">
            <svg className="w-3.5 h-3.5 text-subtle-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <Typography variant="label-xs" className="uppercase tracking-widest leading-none">
              Nghiệp vụ
            </Typography>
          </div>
          <div className="w-1/2 flex items-center gap-2 px-6 py-3">
            <Users className="w-3.5 h-3.5 text-subtle-text" />
            <Typography variant="label-xs" className="uppercase tracking-widest leading-none">
              Nhân viên được phân quyền
            </Typography>
          </div>
        </div>
      )}

      {/* Module Permissions */}
      {isExpanded && (
        <div className="rounded-b-xl overflow-visible">
          {module.permissions.map((permission, index) => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              onAddEmployee={(employee) => onAddEmployee(permission.id, employee)}
              onRemoveEmployee={(employeeId) => onRemoveEmployee(permission.id, employeeId)}
              depth={1}
              className={cn(index === module.permissions.length - 1 && "rounded-b-xl")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
