"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardMetrics } from "@/lib/admin-dashboard-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type { DashboardMetrics } from "@/lib/admin-dashboard-service";

export function useAdminDashboardMetrics() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "ADMIN");

  return useQuery<DashboardMetrics, ApiErrorResponse>({
    queryKey: ["admin-dashboard", "metrics"],
    queryFn: fetchAdminDashboardMetrics,
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
