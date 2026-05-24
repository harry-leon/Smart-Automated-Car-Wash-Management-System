export interface ReportSummary {
  dailyBookings: number;
  monthlyBookings: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  noShowRate: number;
  promotionUsage: number;
  pointsEarned: number;
  pointsRedeemed: number;
}

export interface BookingTrendPoint {
  label: string;
  bookings: number;
  completed: number;
}

export interface PromotionEffectivenessRow {
  promotionName: string;
  usage: number;
  revenueImpact: number;
  conversionRate: number;
}

export interface PointSummaryRow {
  type: "EARN" | "REDEEM" | "ADJUST" | "EXPIRE" | "REFUND";
  total: number;
  transactionCount: number;
}
