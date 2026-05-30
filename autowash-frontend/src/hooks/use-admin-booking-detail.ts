import { useQuery } from "@tanstack/react-query";
import { getAdminBookingDetail } from "@/lib/admin-reporting-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type { BookingDetail } from "@/types/booking.types";

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
