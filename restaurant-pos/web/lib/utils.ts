// FILE: web/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(value);
}

export function compactId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function dayKey(dateIso: string): string {
  const d = new Date(dateIso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
