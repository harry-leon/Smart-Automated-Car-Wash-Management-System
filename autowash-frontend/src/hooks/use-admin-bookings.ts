import { useQuery } from "@tanstack/react-query";
import { listAdminBookings } from "@/lib/admin-reporting-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AdminBookingsFilters, AdminBookingsPage } from "@/types/admin-reporting.types";

export function useAdminBookings(
  filters: AdminBookingsFilters = {},
  page = 1,
  limit = 20,
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
