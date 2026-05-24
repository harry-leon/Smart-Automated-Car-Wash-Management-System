import * as React from "react";
import {
  type Booking,
  type CustomerRecord,
  type StaffRecord,
  type WashSessionRecord,
  useCarwashStore,
} from "@/lib/carwash-store";
import type {
  OperationBooking,
  OperationFilters,
  OperationHourOption,
  OperationsTimeFilter,
  StaffOption,
} from "../types/operations.types";

const NO_SHOW_GRACE_MINUTES = 20;

const SERVICE_DURATION_MINUTES: Record<string, number> = {
  "Basic Wash": 35,
  "Interior Vacuum": 10,
  "Premium Detail": 70,
  "Ceramic Coating": 95,
};

function addMinutes(value: string, minutes: number) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function parseSchedule(dateISO: string, timeSlot: string) {
  const match = timeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return new Date(`${dateISO} ${timeSlot}`);

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function getScheduledIso(booking: Booking) {
  const parsed = parseSchedule(booking.dateISO, booking.timeSlot);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

  const fallback = new Date(booking.scheduledAt);
  if (!Number.isNaN(fallback.getTime())) return fallback.toISOString();

  return booking.createdAt;
}

function getPackageDuration(serviceNames: string[]) {
  return Math.max(
    25,
    serviceNames.reduce(
      (total, serviceName) => total + (SERVICE_DURATION_MINUTES[serviceName] ?? 30),
      0,
    ),
  );
}

function getSessionForBooking(sessions: WashSessionRecord[], bookingId: string) {
  return sessions.find((session) => session.bookingId === bookingId);
}

function getAssignedStaff(
  booking: Booking,
  index: number,
  sessions: WashSessionRecord[],
  staffMembers: StaffRecord[],
) {
  const session = getSessionForBooking(sessions, booking.id);
  const activeStaff = staffMembers.filter((staff) => staff.status === "Active");
  const staff =
    staffMembers.find((item) => item.id === session?.staffId) ??
    activeStaff[index % Math.max(activeStaff.length, 1)] ??
    staffMembers[0];

  return {
    id: staff?.id ?? "unassigned",
    name: staff?.name ?? "Unassigned",
  };
}

function getCustomer(booking: Booking, customers: CustomerRecord[]) {
  return customers.find((customer) => customer.id === booking.customerId);
}

function getOperationStatus(booking: Booking, scheduledAt: string): OperationBooking["status"] {
  if (booking.status === "Cancelled") return "CANCELLED";
  if (booking.status === "No-show") return "NO_SHOW";
  if (booking.status === "Completed" || booking.washStatus === "Completed") return "COMPLETED";
  if (booking.status === "Checked-in" && booking.washStatus === "In Progress") {
    return "IN_PROGRESS";
  }
  if (booking.status === "Checked-in") return "CHECKED_IN";
  if (
    booking.status === "Confirmed" &&
    Date.now() - new Date(scheduledAt).getTime() > NO_SHOW_GRACE_MINUTES * 60 * 1000
  ) {
    return "NO_SHOW";
  }
  return "CONFIRMED";
}

function toOperationBooking(
  booking: Booking,
  index: number,
  customers: CustomerRecord[],
  staffMembers: StaffRecord[],
  washSessions: WashSessionRecord[],
): OperationBooking | null {
  const scheduledAt = getScheduledIso(booking);
  const customer = getCustomer(booking, customers);
  const assignedStaff = getAssignedStaff(booking, index, washSessions, staffMembers);
  const duration = getPackageDuration(booking.services);
  const status = getOperationStatus(booking, scheduledAt);
  const checkinTime = booking.checkInAt;
  const session = getSessionForBooking(washSessions, booking.id);
  const completedTime = booking.completedAt ?? session?.completedAt;

  return {
    id: booking.id,
    bookingCode: booking.id,
    customerName: booking.customerName ?? customer?.name ?? "Unknown customer",
    customerPhone: booking.customerPhone ?? customer?.phone ?? "-",
    vehiclePlate: booking.vehiclePlate,
    vehicleModel: booking.vehicleName,
    servicePackage: booking.services.join(" + "),
    packageDurationMinutes: duration,
    customerNote: booking.notes?.trim() || "No customer note.",
    assignedStaffId: assignedStaff.id,
    assignedStaff: assignedStaff.name,
    scheduledAt,
    checkinTime,
    estimatedFinishTime: checkinTime ? addMinutes(checkinTime, duration) : undefined,
    completedTime,
    status,
    pointTransaction:
      completedTime && booking.checkoutPointsEarned !== undefined
        ? {
            id: `PTS-${booking.id}`,
            createdAt: completedTime,
            pointsEarned: booking.checkoutPointsEarned,
            description: `Earned points for completed wash ${booking.id}`,
          }
        : undefined,
  };
}

export function useOperationBookings() {
  const { bookings, customers, staffMembers, washSessions } = useCarwashStore();

  return React.useMemo(
    () =>
      bookings
        .map((booking, index) =>
          toOperationBooking(booking, index, customers, staffMembers, washSessions),
        )
        .filter((booking): booking is OperationBooking => Boolean(booking))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [bookings, customers, staffMembers, washSessions],
  );
}

export function useOperationActions() {
  const { checkInOperationalBooking, completeOperationalWash, startOperationalWash } =
    useCarwashStore();

  return React.useMemo(
    () => ({
      checkInBooking: checkInOperationalBooking,
      completeWashBooking: completeOperationalWash,
      startWashBooking: startOperationalWash,
    }),
    [checkInOperationalBooking, completeOperationalWash, startOperationalWash],
  );
}

export function useOperationStaffOptions(): StaffOption[] {
  const { staffMembers } = useCarwashStore();

  return React.useMemo(
    () =>
      staffMembers
        .filter((staff) => staff.status === "Active")
        .map((staff) => ({ id: staff.id, name: staff.name })),
    [staffMembers],
  );
}

export function getOperationHourOptions(bookings: OperationBooking[]): OperationHourOption[] {
  return getOperationHourOptionsByLocale(bookings, "en-US");
}

export function getOperationHourOptionsByLocale(
  bookings: OperationBooking[],
  locale: string,
): OperationHourOption[] {
  return Array.from(
    new Map(
      bookings.map((booking) => {
        const date = new Date(booking.scheduledAt);
        const value = String(date.getHours()).padStart(2, "0");
        const label = new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
        return [value, { value, label }];
      }),
    ).values(),
  ).sort((a, b) => a.value.localeCompare(b.value));
}

export function formatOperationTime(value?: string) {
  return formatOperationTimeByLocale(value, "en-US");
}

export function formatOperationTimeByLocale(value: string | undefined, locale: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatOperationDateTime(value?: string) {
  return formatOperationDateTimeByLocale(value, "en-US");
}

export function formatOperationDateTimeByLocale(value: string | undefined, locale: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function filterOperationBookings(bookings: OperationBooking[], filters: OperationFilters) {
  return bookings.filter((booking) => {
    if (filters.status !== "ALL" && booking.status !== filters.status) return false;
    if (filters.staffId !== "ALL" && booking.assignedStaffId !== filters.staffId) return false;
    if (filters.hour !== "ALL" && getHourValue(booking.scheduledAt) !== filters.hour) return false;
    if (filters.time !== "ALL" && getTimeBucket(booking.scheduledAt) !== filters.time) {
      return false;
    }
    return true;
  });
}

function getHourValue(value: string) {
  return String(new Date(value).getHours()).padStart(2, "0");
}

function getTimeBucket(value: string): OperationsTimeFilter {
  const hour = new Date(value).getHours();
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}
