import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const INCIDENT_LABELS: Record<string, string> = {
  reckless: "Reckless Driving",
  speeding: "Speeding",
  texting: "Texting While Driving",
  parking: "Terrible Parking",
  "road-rage": "Road Rage",
  other: "Other",
};

export const INCIDENT_COLORS: Record<string, string> = {
  reckless: "bg-red-500 text-white",
  speeding: "bg-orange-500 text-white",
  texting: "bg-yellow-500 text-white",
  parking: "bg-blue-500 text-white",
  "road-rage": "bg-purple-500 text-white",
  other: "bg-gray-500 text-white",
};

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
