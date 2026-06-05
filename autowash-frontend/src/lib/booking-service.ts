import { apiClient, apiRequest } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type {
  BookingAddon,
  BookingCombo,
  BookingDetail,
  BookingDraft,
  BookingListFilters,
  BookingListItem,
  BookingListPage,
  BookingOtpResponse,
  BookingPackage,
  ApplyBookingPointsRequest,
  ApplyBookingPointsResponse,
  CreateBookingResponse,
  VoucherValidationRequest,
  VoucherValidationResult,
  WashTrackingSession,
} from "@/types/booking.types";
import { buildCreateBookingPayload } from "@/lib/booking-format";

export async function listBookingPackages(page = 1, limit = 20): Promise<BookingPackage[]> {
  const response = await apiClient.get<ApiPaginatedResponse<BookingPackage>>("/packages", {
    params: { page, limit },
  });

  return response.data.data;
}

export async function listBookingAddons(): Promise<BookingAddon[]> {
  const response = await apiClient.get("/add-ons");
  return response.data.data as BookingAddon[];
}

export async function listBookingCombos(): Promise<BookingCombo[]> {
  const response = await apiClient.get("/combos/available");
  return response.data.data as BookingCombo[];
}

export function validateBookingVoucher(payload: VoucherValidationRequest) {
  return apiRequest<VoucherValidationResult, VoucherValidationRequest>({
    method: "POST",
    url: "/bookings/validate-voucher",
    data: payload,
  });
}

export function createCustomerBooking(draft: BookingDraft) {
  return apiRequest<CreateBookingResponse, ReturnType<typeof buildCreateBookingPayload>>({
    method: "POST",
    url: "/customers/bookings",
    data: buildCreateBookingPayload(draft),
  });
}

export function resendBookingOtp(bookingId: string) {
  return apiRequest<BookingOtpResponse>({
    method: "POST",
    url: `/customers/bookings/${bookingId}/otp/resend`,
  });
}

export function verifyBookingOtp(bookingId: string, otp: string) {
  return apiRequest<BookingOtpResponse, { otp: string }>({
    method: "POST",
    url: `/customers/bookings/${bookingId}/otp/verify`,
    data: { otp },
  });
}

export async function listCustomerBookings(filters: BookingListFilters = {}): Promise<BookingListPage> {
  const response = await apiClient.get<ApiPaginatedResponse<BookingListItem>>("/customers/bookings", {
    params: {
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export function getCustomerBookingDetail(bookingId: string) {
  return apiRequest<BookingDetail>({
    method: "GET",
    url: `/customers/bookings/${bookingId}`,
  });
}

export function applyBookingPoints(bookingId: string, payload: ApplyBookingPointsRequest) {
  return apiRequest<ApplyBookingPointsResponse, ApplyBookingPointsRequest>({
    method: "POST",
    url: `/bookings/${bookingId}/apply-points`,
    data: payload,
  });
}

export function getActiveWashTracking() {
  return apiRequest<WashTrackingSession | null>({
    method: "GET",
    url: "/customers/wash-tracking/active",
  });
}

export function getWashTrackingDetail(washSessionId: string) {
  return apiRequest<WashTrackingSession>({
    method: "GET",
    url: `/customers/wash-tracking/${washSessionId}`,
  });
}
