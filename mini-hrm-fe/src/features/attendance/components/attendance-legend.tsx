import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { ATTENDANCE_STATUS_LABELS } from "../constants";

interface LegendItemProps {
  color?: string;
  label: string;
  borderClass?: string;
  style?: React.CSSProperties;
  shapeClass?: string;
}

export function LegendItem({ color, label, borderClass, style, shapeClass = "size-2.5 rounded-full" }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(shapeClass, color, borderClass)} style={style} />
      <Typography variant="label-xs" className="whitespace-nowrap">
        {label}
      </Typography>
    </div>
  );
}

export function AttendanceLegend() {
  return (
    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-line-subtle shadow-sm flex-wrap">
      <LegendItem color="bg-success" label={ATTENDANCE_STATUS_LABELS.ON_TIME} />
      <LegendItem color="bg-warning" label={ATTENDANCE_STATUS_LABELS.LATE} />
      <LegendItem color="bg-purple-500" label={ATTENDANCE_STATUS_LABELS.LEAVE} />
      <LegendItem color="bg-danger" label={ATTENDANCE_STATUS_LABELS.ABSENT} />
      <div className="w-px h-4 bg-line-subtle mx-1" />
      <LegendItem 
        label={ATTENDANCE_STATUS_LABELS.WEEKEND} 
        borderClass="ring-1 ring-slate-300 shadow-sm" 
        shapeClass="w-4 h-2.5 rounded-[3px]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #e2e8f0 0px, #e2e8f0 2px, #ffffff 2px, #ffffff 4px)" }}
      />
    </div>
  );
}
