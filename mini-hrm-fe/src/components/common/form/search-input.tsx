import * as React from "react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isLoading?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  iconClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, iconClassName, isLoading, onClear, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && value !== "";

    return (
      <div className={cn("relative group w-full", containerClassName)}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <HugeiconsIcon
              icon={Search01Icon}
              className={cn(
                "w-3.5 h-3.5 text-subtle-text group-focus-within:text-primary transition-colors",
                iconClassName
              )}
              strokeWidth={2}
            />
          )}
        </div>
        <Input
          {...props}
          ref={ref}
          value={value}
          className={cn(
            "pl-9 pr-8 h-9 bg-page border-line focus-visible:ring-primary/10 focus-visible:border-primary rounded-xl text-xs transition-all placeholder:text-subtle-text/70 shadow-none",
            className
          )}
        />
        {hasValue && !isLoading && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle-text hover:text-destructive transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
