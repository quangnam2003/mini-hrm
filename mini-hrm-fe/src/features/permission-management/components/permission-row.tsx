"use client";

import { PermissionAPIResponse, UserAPIResponse } from "../types/permission";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { EmployeeSelector } from "./employee-selector";
import { useIsMobile } from "@/hooks/use-mobile";

interface PermissionRowProps {
  permission: PermissionAPIResponse;
  onAddEmployee: (employee: UserAPIResponse) => void;
  onRemoveEmployee: (employeeId: string) => void;
  depth?: number;
  className?: string;
}

export function PermissionRow({
  permission,
  onAddEmployee,
  onRemoveEmployee,
  depth = 0,
  className,
}: PermissionRowProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className={cn(
          "group/row flex flex-col border-b border-line-subtle last:border-0 hover:bg-page/40 transition-colors duration-150",
          depth > 0 && "bg-page/10",
          className
        )}
      >
        {/* Permission info */}
        <div className={cn(
          "py-3 px-4 border-b border-line-subtle flex flex-col justify-center",
          depth > 0 && "pl-10"
        )}>
          <div className="flex items-center gap-2">
            <Typography variant="p" className="text-base font-semibold text-foreground tracking-tight leading-none">
              {permission.name}
            </Typography>
          </div>
        </div>

        {/* Employee selector */}
        <div className="relative px-4 py-2 flex items-center">
          <EmployeeSelector
            selectedEmployees={permission.users}
            onAddEmployee={onAddEmployee}
            onRemoveEmployee={onRemoveEmployee}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group/row flex items-stretch border-b border-line-subtle last:border-0 hover:bg-page/40 transition-colors duration-150",
        depth > 0 && "bg-page/10",
        className
      )}
    >
      {/* Left Column - Permission info */}
      <div className={cn(
        "w-1/2 py-4 px-6 border-r border-line flex flex-col justify-center",
        depth > 0 && "pl-12"
      )}>
        <div className="flex items-center gap-2">
          <Typography variant="p" className="text-base font-semibold text-foreground tracking-tight leading-none">
            {permission.name}
          </Typography>
        </div>
      </div>

      {/* Right Column - Employee selector */}
      <div className="w-1/2 relative px-6 py-2 flex items-center overflow-visible">
        <EmployeeSelector
          selectedEmployees={permission.users}
          onAddEmployee={onAddEmployee}
          onRemoveEmployee={onRemoveEmployee}
        />
      </div>
    </div>
  );
}
