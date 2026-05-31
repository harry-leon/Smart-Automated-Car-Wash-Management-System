"use client";

import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { BookingDraft, CreateBookingResponse } from "@/types/booking.types";

type BookingState = {
  draft: BookingDraft;
  lastCreatedBooking: CreateBookingResponse | null;
};

type BookingActions = {
  updateDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  setLastCreatedBooking: (booking: CreateBookingResponse | null) => void;
};

type BookingStore = BookingState & BookingActions;

export const EMPTY_BOOKING_DRAFT: BookingDraft = {
  mode: "PACKAGE",
  vehicleId: "",
  packageId: "",
  comboId: "",
  addonIds: [],
  bookingDate: "",
  bookingTime: "",
  voucherCode: "",
  paymentMethod: null,
};

const bookingStore = createStore<BookingStore>()((set) => ({
  draft: EMPTY_BOOKING_DRAFT,
  lastCreatedBooking: null,
  updateDraft: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...patch,
      },
    })),
  resetDraft: () =>
    set(() => ({
      draft: EMPTY_BOOKING_DRAFT,
    })),
  setLastCreatedBooking: (booking) =>
    set(() => ({
      lastCreatedBooking: booking,
    })),
}));

export function useBookingStore<T>(selector: (state: BookingStore) => T) {
  return useStore(bookingStore, selector);
}

export function updateBookingDraft(patch: Partial<BookingDraft>) {
  bookingStore.getState().updateDraft(patch);
}

export function resetBookingDraft() {
  bookingStore.getState().resetDraft();
}

export function setLastCreatedBooking(booking: CreateBookingResponse | null) {
  bookingStore.getState().setLastCreatedBooking(booking);
}
