import { apiClient } from "@/lib/api";
import type { ApiPaginatedResponse, ApiResponse } from "@/types/api.types";
import type { AdminBookingResponse, AdminBookingListPage } from "@/types/admin-reporting.types";
import type { BookingDetail } from "@/types/booking.types";

export async function listAdminBookings(
  page = 1,
  limit = 20,
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    searchQuery?: string;
  }
): Promise<AdminBookingListPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminBookingResponse>>("/admin/bookings", {
    params: { page, limit, ...filters },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getAdminBookingDetail(id: string): Promise<BookingDetail> {
  const response = await apiClient.get<ApiResponse<BookingDetail>>(`/admin/bookings/${id}`);
  return response.data.data;
}
