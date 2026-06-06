import config from "../config";

// formatMoney renders a numeric amount with thousands separators + currency.
export function formatMoney(amount) {
  const n = Number(amount || 0);
  return `${new Intl.NumberFormat("en-US").format(n)} ${config.currency}`;
}

// formatDate renders a "YYYY-MM-DD" (or ISO) string as "25 Jun 2026".
export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// formatDateTime adds the time component.
export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const WEEKDAYS = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function weekdayName(n) {
  return WEEKDAYS[n] || "—";
}

// Tailwind badge classes per domain status.
const STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-600",
  confirmed: "bg-indigo-50 text-indigo-600",
  in_progress: "bg-amber-50 text-amber-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
  no_show: "bg-gray-100 text-gray-500",
  unpaid: "bg-amber-50 text-amber-600",
  paid: "bg-green-50 text-green-600",
  refunded: "bg-purple-50 text-purple-600",
};

export function statusClasses(status) {
  return STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
}

export function prettyStatus(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// cn joins truthy class fragments.
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
