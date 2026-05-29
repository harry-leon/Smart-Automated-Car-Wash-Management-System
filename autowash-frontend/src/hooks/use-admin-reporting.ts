"use client";

import { useQuery } from "@tanstack/react-query";
import {
  adminBookingsQueryKey,
  adminCustomerDetailQueryKey,
  adminCustomerPointTransactionsQueryKey,
  adminCustomerWashHistoryQueryKey,
} from "@/hooks/admin-reporting-query";
import {
  getAdminCustomerDetail,
  listAdminBookings,
  listAdminCustomerPointTransactions,
  listAdminCustomerWashHistory,
} from "@/lib/admin-reporting-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type {
  AdminBookingsFilters,
  AdminBookingsPage,
  AdminCustomerDetail,
  AdminPointTransactionsPage,
  AdminWashHistoryPage,
} from "@/types/admin-reporting.types";

function useAdminReportingContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "ADMIN");

  return { userId, enabled };
}

export function useAdminBookings(
  filters: AdminBookingsFilters,
  page = 1,
  limit = 20,
  options?: { enabled?: boolean },
) {
  const { userId, enabled } = useAdminReportingContext();

  return useQuery<AdminBookingsPage, ApiErrorResponse>({
    queryKey: adminBookingsQueryKey(userId, filters, page, limit),
    queryFn: () => listAdminBookings(filters, page, limit),
    enabled: enabled && (options?.enabled ?? true),
  });
}

export function useAdminCustomerDetail(customerId: string, options?: { enabled?: boolean }) {
  const { userId, enabled } = useAdminReportingContext();

  return useQuery<AdminCustomerDetail, ApiErrorResponse>({
    queryKey: adminCustomerDetailQueryKey(userId, customerId),
    queryFn: () => getAdminCustomerDetail(customerId),
    enabled: enabled && customerId.length > 0 && (options?.enabled ?? true),
  });
}

export function useAdminCustomerWashHistory(
  customerId: string,
  params: { page?: number; limit?: number; dateFrom?: string; dateTo?: string },
  options?: { enabled?: boolean },
) {
  const { userId, enabled } = useAdminReportingContext();

  return useQuery<AdminWashHistoryPage, ApiErrorResponse>({
    queryKey: adminCustomerWashHistoryQueryKey(userId, customerId, params),
    queryFn: () => listAdminCustomerWashHistory(customerId, params),
    enabled: enabled && customerId.length > 0 && (options?.enabled ?? true),
  });
}

export function useAdminCustomerPointTransactions(
  customerId: string,
  params: { page?: number; limit?: number; type?: string; dateFrom?: string; dateTo?: string },
  options?: { enabled?: boolean },
) {
  const { userId, enabled } = useAdminReportingContext();

  return useQuery<AdminPointTransactionsPage, ApiErrorResponse>({
    queryKey: adminCustomerPointTransactionsQueryKey(userId, customerId, params),
    queryFn: () => listAdminCustomerPointTransactions(customerId, params),
    enabled: enabled && customerId.length > 0 && (options?.enabled ?? true),
  });
}
