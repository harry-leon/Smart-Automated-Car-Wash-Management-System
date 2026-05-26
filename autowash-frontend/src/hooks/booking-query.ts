import type { BookingListFilters } from "@/types/booking.types";

export function bookingQueryScope(userId?: string | null) {
  return ["customer-bookings", userId ?? "anonymous"] as const;
}

export function bookingsListQueryKey(userId?: string | null, filters: BookingListFilters = {}) {
  return [
    ...bookingQueryScope(userId),
    "list",
    filters.status ?? "ALL",
    filters.dateFrom ?? "ANY",
    filters.dateTo ?? "ANY",
    filters.page ?? 1,
    filters.limit ?? 20,
  ] as const;
}

export function bookingDetailQueryKey(userId?: string | null, bookingId?: string | null) {
  return [...bookingQueryScope(userId), "detail", bookingId ?? "unknown"] as const;
}

export function bookingVoucherQueryKey(
  userId?: string | null,
  voucherCode?: string | null,
  amount = 0,
  packageId?: string | null,
) {
  return [
    ...bookingQueryScope(userId),
    "voucher",
    voucherCode ?? "",
    amount,
    packageId ?? "",
  ] as const;
}
