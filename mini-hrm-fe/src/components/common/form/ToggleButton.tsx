"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const ToggleButton = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer relative inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200",
      className,
    )}
    ref={ref}
    {...props}
  >
    <span className="pointer-events-none absolute inset-0 rounded-full shadow-inner" />

    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none relative block h-[14px] w-[14px] rounded-full shadow-md ring-0",
        "data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[1px]",
        "data-[state=checked]:bg-white data-[state=unchecked]:bg-white",
      )}
    ></SwitchPrimitive.Thumb>
  </SwitchPrimitive.Root>
));

ToggleButton.displayName = "ToggleButton";

export { ToggleButton };
