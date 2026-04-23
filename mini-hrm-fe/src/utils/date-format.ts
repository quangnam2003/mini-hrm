import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Định dạng ngày đầy đủ: Thứ..., ngày dd tháng MM, yyyy
 */
export const formatFullDate = (date: string | Date | null | undefined) => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  
  if (!isValid(d)) return typeof date === "string" ? date : "";
  
  return format(d, "EEEE, 'ngày' dd 'tháng' MM, yyyy", { locale: vi });
};

/**
 * Định dạng giờ: HH:mm:ss hoặc HH:mm
 */
export const formatTime = (time: string | Date | null | undefined, includeSeconds = true) => {
  if (!time) return "--:--";
  
  // Xử lý case string format "2024-04-20 08:00:00" hoặc ISO
  const d = typeof time === "string" ? new Date(time) : time;
  
  if (!isValid(d)) return typeof time === "string" ? time : "--:--";
  
  return format(d, includeSeconds ? "HH:mm:ss" : "HH:mm");
};

/**
 * Định dạng số giờ (vd: 8.5) thành dạng text "X giờ" hoặc "Y phút" nếu quá ngắn
 */
export const formatDurationFromHours = (hoursVal: string | number | null | undefined): string => {
  if (!hoursVal) return "0 phút";
  const numHours = typeof hoursVal === "string" ? parseFloat(hoursVal) : hoursVal;
  if (isNaN(numHours) || numHours <= 0) return "0 phút";
  
  if (numHours < 1) {
    const m = Math.round(numHours * 60);
    if (m === 0 && numHours > 0) return "< 1 phút";
    return `${m} phút`;
  }
  
  const roundedHours = Math.round(numHours * 10) / 10;
  return `${roundedHours} giờ`;
};

/**
 * Định dạng số phút (vd: 311) thành dạng text "X.X giờ" hoặc "Y phút"
 */
export const formatDurationFromMinutes = (minutesVal: string | number | null | undefined): string => {
  if (!minutesVal) return "0 phút";
  const numMinutes = typeof minutesVal === "string" ? parseInt(minutesVal, 10) : minutesVal;
  if (isNaN(numMinutes) || numMinutes <= 0) return "0 phút";
  
  if (numMinutes < 60) {
    return `${numMinutes} phút`;
  }
  
  const hoursDecimal = numMinutes / 60;
  const roundedHours = Math.round(hoursDecimal * 10) / 10;
  return `${roundedHours} giờ`;
};
