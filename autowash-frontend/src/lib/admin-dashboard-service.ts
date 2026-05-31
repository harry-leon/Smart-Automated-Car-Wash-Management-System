import { apiClient } from "@/lib/api";
import type { ApiSuccessResponse } from "@/types/api.types";

export type DashboardMetrics = {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  activePromotions: number;
};

export async function fetchAdminDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardMetrics>>(
    "/admin/dashboard/metrics"
  );
  return response.data.data;
}
