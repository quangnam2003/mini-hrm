import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * A premium, Shadcn-inspired Checkbox component.
 * Uses a hidden native input for form compatibility and a custom styled div for the UI.
 */
const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, checked, ...props }, ref) => {
  const isChecked = !!checked;

  return (
    <div className="relative inline-flex items-center group cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        checked={isChecked}
        className={cn(
          "peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
          className,
        )}
        {...props}
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded-[4px] border border-slate-300 bg-white transition-all duration-200 ease-in-out",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          "group-hover:border-primary/50",
          isChecked && "bg-primary border-primary scale-100",
          !isChecked && "scale-95",
          className,
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 text-white transition-all duration-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            isChecked ? "opacity-100 scale-100" : "opacity-0 scale-50",
          )}
          strokeWidth={4}
        />
      </div>
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
