import { useQuery } from "@tanstack/react-query";
import { listAdminBookings } from "@/features/admin/reports/api/admin-reporting-service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type { AdminBookingsFilters, AdminBookingsPage } from "@/features/admin/reports/admin-reporting.types";

export function useAdminBookings(
  page = 1,
  limit = 20,
  filters: AdminBookingsFilters = {},
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "ADMIN");

  return useQuery<AdminBookingsPage, ApiErrorResponse>({
    queryKey: ["admin-bookings", page, limit, filters],
    queryFn: () => listAdminBookings(filters, page, limit),
    enabled,
  });
}
