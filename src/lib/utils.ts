import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const THAI_FULL_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_DAYS = [
  "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"
];

export function toDateObj(date: string | Date): Date {
  return typeof date === "string" ? parseISO(date) : date;
}

/**
 * Format date to Thai format with Buddhist Era (พ.ศ.)
 * e.g. 29 ต.ค. 2569
 */
export function formatThaiDate(date: string | Date, isShort = true): string {
  try {
    const d = toDateObj(date);
    const day = d.getDate();
    const month = isShort ? THAI_MONTHS[d.getMonth()] : THAI_FULL_MONTHS[d.getMonth()];
    const buddhistYear = d.getFullYear() + 543;
    return `${day} ${month} ${buddhistYear}`;
  } catch {
    return "-";
  }
}

/**
 * Format time to Thai format (HH:mm น.)
 * e.g. 09:30 น.
 */
export function formatThaiTime(date: string | Date): string {
  try {
    const d = toDateObj(date);
    return format(d, "HH:mm") + " น.";
  } catch {
    return "-";
  }
}

/**
 * Format datetime to Thai format
 * e.g. 29 ต.ค. 2569 เวลา 09:30 น.
 */
export function formatThaiDateTime(date: string | Date): string {
  try {
    const d = toDateObj(date);
    return `${formatThaiDate(d)} เวลา ${formatThaiTime(d)}`;
  } catch {
    return "-";
  }
}

/**
 * Format time range e.g. 09:00 - 11:30 น.
 */
export function formatTimeRange(start: string | Date, end: string | Date): string {
  try {
    const s = toDateObj(start);
    const e = toDateObj(end);
    return `${format(s, "HH:mm")} - ${format(e, "HH:mm")} น.`;
  } catch {
    return "-";
  }
}
