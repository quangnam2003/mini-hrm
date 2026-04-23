import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { AttendanceDayData, AttendanceDayType } from '../types/attendance';

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};


export const generateMockAttendanceData = (
  baseDate: Date = new Date(),
  monthsCount: number = 3
): AttendanceDayData[] => {
  const startDate = startOfMonth(baseDate);
  const endDate = endOfMonth(addMonths(startDate, monthsCount - 1));

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((date, index) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();
    
    const dayType: AttendanceDayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'workday';
    
    const dayNum = date.getDate();
    const hasStatus = dayType === 'workday' && dayNum % 5 !== 0; 

    return {
      id: index + 1,
      work_date: dateStr,
      day_type: dayType,
      holiday_name: null,
      note: null,
      total_employees: hasStatus ? 4 : 0,
      status: hasStatus ? {
        on_time: Math.floor(Math.random() * 3) + 1,
        late: Math.floor(Math.random() * 2),
        absent: Math.floor(Math.random() * 2),
      } : undefined
    };
  });
};
