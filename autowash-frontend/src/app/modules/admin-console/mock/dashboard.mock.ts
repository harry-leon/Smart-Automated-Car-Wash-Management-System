import type { KpiMetric } from "../types/dashboard.types";
import { adminBookings } from "./bookings.mock";

export const dashboardKpis: KpiMetric[] = [
  {
    id: "today-bookings",
    label: "Today bookings",
    value: 18,
    delta: 12,
    icon: "Calendar",
    tone: "primary",
  },
  {
    id: "completed-washes",
    label: "Completed washes",
    value: 14,
    delta: 8,
    icon: "CheckCircle2",
    tone: "success",
  },
  {
    id: "no-show",
    label: "No-show count",
    value: 2,
    delta: -1,
    icon: "AlertTriangle",
    tone: "warning",
  },
  {
    id: "points-issued",
    label: "Points issued",
    value: 5240,
    delta: 18,
    unit: "pts",
    icon: "Coins",
    tone: "info",
  },
  {
    id: "active-promotions",
    label: "Active promotions",
    value: 4,
    delta: 1,
    icon: "Sparkles",
    tone: "purple",
  },
];

export const recentBookings = adminBookings.slice(0, 6);
