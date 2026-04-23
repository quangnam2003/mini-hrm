import React from "react";
import { LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2", className)}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5">
          <Icon size={16} className="text-primary" />
        </div>
        <div className="flex flex-col">
          <Typography
            variant="h3"
            className="text-lg font-semibold text-foreground tracking-tight"
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="small" className="text-xs text-muted-foreground leading-tight">
              {description}
            </Typography>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
