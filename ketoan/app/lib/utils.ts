import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number to Vietnamese currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

/**
 * Format number with thousand separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string | null | undefined, includeTime = false): string {
  if (!date) return '---';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '---';

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const format = new Intl.DateTimeFormat('vi-VN', {
    ...dateOptions,
    ...(includeTime ? timeOptions : {}),
  });

  return format.format(d);
}

/**
 * Get date range for filter (last N months)
 */
export function getDateRange(months: number): { fromDate: string; toDate: string } {
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    fromDate: fromDate.toISOString().split('T')[0],
    toDate: toDate.toISOString().split('T')[0],
  };
}
