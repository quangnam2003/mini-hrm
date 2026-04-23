"use client"

import { AttendanceLegend } from "./attendance-legend";
import { MonthNavigator } from "./month-navigator";

export function MyAttendanceControls() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <MonthNavigator />
      <AttendanceLegend />
    </div>
  );
}
