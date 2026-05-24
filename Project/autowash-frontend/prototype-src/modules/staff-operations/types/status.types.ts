export const STAFF_BOOKING_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export type StaffBookingStatus = (typeof STAFF_BOOKING_STATUSES)[number];

export const STAFF_BOOKING_STATUS_LABELS: Record<StaffBookingStatus, string> = {
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

export const STAFF_BOOKING_STATUS_LABELS_VI: Record<StaffBookingStatus, string> = {
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang rửa",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
};
