import { useQuery } from "@tanstack/react-query";
import { getAdminBookingDetail } from "@/features/reports/api/admin-reporting-service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type { BookingDetail } from "@/entities/bookings";

export function useAdminBookingDetail(id: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "ADMIN" && id);

  return useQuery<BookingDetail, ApiErrorResponse>({
    queryKey: ["admin-booking-detail", id],
    queryFn: () => getAdminBookingDetail(id),
    enabled,
  });
}
