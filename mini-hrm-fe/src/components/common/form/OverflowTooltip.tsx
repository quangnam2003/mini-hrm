import { useRef, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OverflowTooltip({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setIsOverflow(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={ref} className="block truncate cursor-default">
            {text}
          </span>
        </TooltipTrigger>

        {isOverflow && (
          <TooltipContent
            side="top"
            align="center"
            className="z-50 max-w-[280px] break-words bg-slate-800 text-white shadow-xl px-3 py-2 text-xs font-medium rounded-lg"
          >
            {text}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
