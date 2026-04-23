"use client"

import { AttendanceLegend } from "./attendance-legend";
import { MonthNavigator } from "./month-navigator";

export function AttendanceControls() {
  return (
    <div className="flex items-center gap-3">
      <MonthNavigator />
      <AttendanceLegend />
    </div>
  );
}
