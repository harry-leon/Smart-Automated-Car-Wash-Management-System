import type {
  ReportSummary,
  BookingTrendPoint,
  PromotionEffectivenessRow,
  PointSummaryRow,
} from "../types/report.types";

export const reportSummary: ReportSummary = {
  dailyBookings: 18,
  monthlyBookings: 412,
  dailyRevenue: 4_280_000,
  monthlyRevenue: 96_540_000,
  noShowRate: 4.6,
  promotionUsage: 218,
  pointsEarned: 5240,
  pointsRedeemed: 1830,
};

export const bookingTrend: BookingTrendPoint[] = [
  { label: "Mon", bookings: 22, completed: 19 },
  { label: "Tue", bookings: 18, completed: 16 },
  { label: "Wed", bookings: 25, completed: 21 },
  { label: "Thu", bookings: 30, completed: 27 },
  { label: "Fri", bookings: 34, completed: 30 },
  { label: "Sat", bookings: 42, completed: 36 },
  { label: "Sun", bookings: 28, completed: 24 },
];

export const promotionEffectiveness: PromotionEffectivenessRow[] = [
  {
    promotionName: "Summer Splash 2026",
    usage: 248,
    revenueImpact: 18_600_000,
    conversionRate: 32.4,
  },
  {
    promotionName: "Welcome New Drivers",
    usage: 412,
    revenueImpact: 22_300_000,
    conversionRate: 41.5,
  },
  {
    promotionName: "Gold Detail Bonus",
    usage: 96,
    revenueImpact: 11_800_000,
    conversionRate: 18.2,
  },
  { promotionName: "Mid-week Cleanse", usage: 73, revenueImpact: 4_900_000, conversionRate: 12.7 },
];

export const pointSummary: PointSummaryRow[] = [
  { type: "EARN", total: 28_540, transactionCount: 312 },
  { type: "REDEEM", total: -9_800, transactionCount: 47 },
  { type: "ADJUST", total: 620, transactionCount: 5 },
  { type: "EXPIRE", total: -1_240, transactionCount: 18 },
  { type: "REFUND", total: 480, transactionCount: 3 },
];
