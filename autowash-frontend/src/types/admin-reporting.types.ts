export type AdminBookingResponse = {
  bookingId: string;
  confirmationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  servicePackageId: string;
  servicePackageName: string;
  bookingDate: string;
  bookingTime: string;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  sessionId: string | null;
  washStatus: string | null;
  createdAt: string;
};

export type AdminBookingListPage = {
  items: AdminBookingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type ReportRangeKey = "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" | "THIS_QUARTER";
export type ReportAnalysisGroup = "revenue" | "service" | "promotion" | "channel";

export type AdminReportPeriod = {
  key: string;
  label: string;
  dateFrom: string;
  dateTo: string;
};

export type AdminReportPoint = {
  label: string;
  value: number;
};

export type AdminReportSeries = {
  points: AdminReportPoint[];
  previousPoints: AdminReportPoint[];
};

export type AdminReportBreakdownItem = {
  key: string;
  label: string;
  revenue: number;
  bookings: number;
  share: number;
};

export type AdminReportBreakdown = {
  available: boolean;
  items: AdminReportBreakdownItem[];
  message: string | null;
};

export type AdminBusinessHealthReport = {
  period: AdminReportPeriod;
  previousPeriod: AdminReportPeriod;
  kpis: {
    revenueThisPeriod: number;
    revenuePreviousPeriod: number;
    revenueGrowthRate: number;
    completedBookings: number;
    completedBookingsGrowthRate: number;
    averageBookingValue: number;
    cancellationRate: number;
    discountAssistedRevenue: number;
  };
  trends: {
    revenue: AdminReportSeries;
    completedBookings: AdminReportSeries;
  };
  breakdowns: {
    revenue: AdminReportBreakdown;
    service: AdminReportBreakdown;
    promotion: AdminReportBreakdown;
    channel: AdminReportBreakdown;
  };
  insights: Array<{
    tone: "positive" | "negative" | "neutral" | string;
    title: string;
    summary: string;
  }>;
  topItems: {
    services: AdminReportBreakdownItem[];
  };
  capabilities: {
    channelAvailable: boolean;
    promotionAttributionExact: boolean;
  };
};
