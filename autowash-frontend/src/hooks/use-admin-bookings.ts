import { useQuery } from "@tanstack/react-query";
import { listAdminBookings } from "@/lib/admin-reporting-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AdminBookingListPage } from "@/types/admin-reporting.types";

export function useAdminBookings(
  page = 1,
  limit = 20,
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    searchQuery?: string;
  }
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "ADMIN");

  return useQuery<AdminBookingListPage, ApiErrorResponse>({
    queryKey: ["admin-bookings", page, limit, filters],
    queryFn: () => listAdminBookings(page, limit, filters),
    enabled,
  });
}
