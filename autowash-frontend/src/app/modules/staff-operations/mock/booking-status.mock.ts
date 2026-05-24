import {
  STAFF_BOOKING_STATUSES,
  STAFF_BOOKING_STATUS_LABELS,
  STAFF_BOOKING_STATUS_LABELS_VI,
  type StaffBookingStatus,
} from "../types/status.types";

export const bookingStatusOptions = STAFF_BOOKING_STATUSES.map((status) => ({
  value: status,
  label: STAFF_BOOKING_STATUS_LABELS[status],
  labelVi: STAFF_BOOKING_STATUS_LABELS_VI[status],
}));

export const actionableStatuses: StaffBookingStatus[] = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];
