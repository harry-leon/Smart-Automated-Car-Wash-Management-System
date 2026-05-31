"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerBooking,
  getCustomerBookingDetail,
  listBookingAddons,
  listBookingCombos,
  listBookingPackages,
  listCustomerBookings,
  validateBookingVoucher,
} from "@/lib/booking-service";
import {
  bookingDetailQueryKey,
  bookingQueryScope,
  bookingsListQueryKey,
} from "@/hooks/booking-query";
import { useAuthStore } from "@/store/auth.store";
import { resetBookingDraft, setLastCreatedBooking } from "@/store/booking.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type {
  BookingDetail,
  BookingDraft,
  BookingListFilters,
  BookingListPage,
  BookingPackage,
  CreateBookingResponse,
  VoucherValidationRequest,
  VoucherValidationResult,
  BookingAddon,
  BookingCombo,
} from "@/types/booking.types";

function useBookingQueryContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "CUSTOMER");

  return { enabled, userId };
}

export function useBookingPackages() {
  const { enabled } = useBookingQueryContext();

  return useQuery<BookingPackage[], ApiErrorResponse>({
    queryKey: ["booking-catalog", "packages"],
    queryFn: () => listBookingPackages(),
    enabled,
  });
}

export function useBookingAddons() {
  const { enabled } = useBookingQueryContext();

  return useQuery<BookingAddon[], ApiErrorResponse>({
    queryKey: ["booking-catalog", "addons"],
    queryFn: listBookingAddons,
    enabled,
  });
}

export function useBookingCombos() {
  const { enabled } = useBookingQueryContext();

  return useQuery<BookingCombo[], ApiErrorResponse>({
    queryKey: ["booking-catalog", "combos"],
    queryFn: listBookingCombos,
    enabled,
  });
}

export function useValidateBookingVoucher() {
  return useMutation<VoucherValidationResult, ApiErrorResponse, VoucherValidationRequest>({
    mutationFn: validateBookingVoucher,
  });
}

export function useCreateCustomerBooking() {
  const queryClient = useQueryClient();
  const { userId } = useBookingQueryContext();

  return useMutation<CreateBookingResponse, ApiErrorResponse, BookingDraft>({
    mutationFn: createCustomerBooking,
    onSuccess: async (booking) => {
      setLastCreatedBooking(booking);
      resetBookingDraft();
      await queryClient.invalidateQueries({ queryKey: bookingQueryScope(userId) });
    },
  });
}

export function useCustomerBookings(filters: BookingListFilters = {}) {
  const { enabled, userId } = useBookingQueryContext();

  return useQuery<BookingListPage, ApiErrorResponse>({
    queryKey: bookingsListQueryKey(userId, filters),
    queryFn: () => listCustomerBookings(filters),
    enabled,
  });
}

export function useCustomerBookingDetail(bookingId: string) {
  const { enabled, userId } = useBookingQueryContext();

  return useQuery<BookingDetail, ApiErrorResponse>({
    queryKey: bookingDetailQueryKey(userId, bookingId),
    queryFn: () => getCustomerBookingDetail(bookingId),
    enabled: enabled && bookingId.length > 0,
  });
}
