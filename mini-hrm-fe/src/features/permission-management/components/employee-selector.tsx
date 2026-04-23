"use client";

import { useState } from "react";
import { PlusSignIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserAPIResponse } from "../types/permission";
import { Typography } from "@/components/ui/typography";
import { EmployeePopover } from "./employee-popover";
import { AssignedEmployeesModal } from "./assigned-employees-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { UserAvatar } from "@/components/common/avatar/user-avatar";

interface EmployeeSelectorProps {
  selectedEmployees: UserAPIResponse[];
  onAddEmployee: (employee: UserAPIResponse) => void;
  onRemoveEmployee: (employeeId: string) => void;
}

const MAX_VISIBLE_AVATARS = 10;
const MAX_VISIBLE_AVATARS_MOBILE = 5;

export function EmployeeSelector({
  selectedEmployees,
  onAddEmployee,
  onRemoveEmployee,
}: EmployeeSelectorProps) {
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const maxVisible = isDesktop ? MAX_VISIBLE_AVATARS : MAX_VISIBLE_AVATARS_MOBILE;
  const visibleSelected = selectedEmployees.slice(0, maxVisible);
  const hiddenCount = Math.max(0, selectedEmployees.length - maxVisible);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 py-1">
        {/* Selected Employees List */}
        <div className={cn(
          "flex items-center gap-1.5",
          isMobile ? "flex-nowrap overflow-x-auto no-scrollbar min-w-0" : "mr-1"
        )}>
          {visibleSelected.map((employee) => (
            <Tooltip key={employee.id}>
              <TooltipTrigger asChild>
                <div className="group/avatar relative flex-shrink-0">
                  <button
                    onClick={() => onRemoveEmployee(employee.id)}
                    className="relative block transition-transform active:scale-95"
                  >
                    <UserAvatar
                      name={employee.name}
                      avatar={employee.avatar}
                      id={employee.id}
                      shortName={employee.shortName}
                    />
                    {/* Remove overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 backdrop-blur-[1px]">
                      <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={2}
              className="bg-base text-white text-[12px] font-medium border-none px-3 pt-1.5 shadow-2xl z-[100]"
            >
              {employee.name}
              <TooltipArrow className="bg-base fill-base" />
            </TooltipContent>
            </Tooltip>
          ))}

          {hiddenCount > 0 && (
            <button
              onClick={() => setIsAssignedModalOpen(true)}
              className="w-8 h-8 rounded-full bg-subtle border border-line hover:bg-subtle/80 transition-colors flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <Typography variant="label-xs" className="text-muted">
                +{hiddenCount}
              </Typography>
            </button>
          )}
        </div>

        {/* Add Button + Popover wrapper */}
        <div className="relative flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddPopoverOpen(!isAddPopoverOpen)}
            className={cn(
              "h-8 w-8 p-0 rounded-full border-line transition-all group shadow-sm",
              isAddPopoverOpen ? "bg-primary-tint border-primary-border text-primary" : "hover:bg-primary-tint hover:border-primary-border hover:text-primary"
            )}
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              className={cn("w-4 h-4 transition-transform duration-300", isAddPopoverOpen ? "rotate-45" : "group-hover:rotate-90")}
              strokeWidth={2.5}
            />
          </Button>

          <EmployeePopover
            isOpen={isAddPopoverOpen}
            onClose={() => setIsAddPopoverOpen(false)}
            onSelect={onAddEmployee}
            selectedEmployees={selectedEmployees}
          />
        </div>

        <AssignedEmployeesModal
          selectedEmployees={selectedEmployees}
          onRemoveEmployee={onRemoveEmployee}
          isOpen={isAssignedModalOpen}
          onClose={() => setIsAssignedModalOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
