import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, formatStr: string = 'dd MMMM yyyy'): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr, { locale: fr });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string, time?: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    const formattedDate = format(date, 'EEEE dd MMMM yyyy', { locale: fr });
    return time ? `${formattedDate} à ${time}` : formattedDate;
  } catch {
    return dateString;
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getAvailableSpots(capacity: number, reservedSpots: number): number {
  return Math.max(0, capacity - reservedSpots);
}

export function getFillRate(capacity: number, reservedSpots: number): number {
  if (capacity === 0) return 0;
  return Math.round((reservedSpots / capacity) * 100);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: string | string[] }).message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return 'Une erreur est survenue';
}
