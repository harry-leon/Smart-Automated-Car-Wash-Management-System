export type StaffAvailabilityStatus = "Available" | "Busy";

export interface AvailabilityStaff {
  id: string;
  name: string;
  status: string;
}

export interface AvailabilitySession {
  id: string;
  staffId: string;
  status: string;
}

export interface StaffAvailability extends AvailabilityStaff {
  availability: StaffAvailabilityStatus;
  activeSessionId?: string;
}

export interface DispatchStaffRecord {
  staffId: string;
  name: string;
  status: "active" | "inactive" | "busy";
  dailyWashCount: number;
  availability: boolean;
}

export interface BookingStaffAssignment {
  assignedStaffId: string;
  assignedStaffName: string;
  washCountAtAssignment: number;
  selectionMethod: "lowest_count" | "random_tiebreak";
  eligibleStaffCount: number;
  reason: "SUCCESS";
}

const COMPLETED_SESSION_STATUS = "Completed";
export const NO_AVAILABLE_STAFF_MESSAGE =
  "No available staff. Please wait until a staff member becomes available.";
export const NO_AVAILABLE_STAFF_REASON = "NO_AVAILABLE_STAFF";

export class StaffAssignmentError extends Error {
  reason: typeof NO_AVAILABLE_STAFF_REASON;

  constructor(reason: typeof NO_AVAILABLE_STAFF_REASON = NO_AVAILABLE_STAFF_REASON, message = NO_AVAILABLE_STAFF_MESSAGE) {
    super(message);
    this.name = "StaffAssignmentError";
    this.reason = reason;
  }
}

export function getStaffAvailability(
  staffMembers: AvailabilityStaff[],
  washSessions: AvailabilitySession[],
): StaffAvailability[] {
  return staffMembers
    .filter((staff) => staff.status === "Active")
    .map((staff) => {
      const activeSession = washSessions.find(
        (session) => session.staffId === staff.id && session.status !== COMPLETED_SESSION_STATUS,
      );

      return {
        ...staff,
        availability: activeSession ? "Busy" : "Available",
        activeSessionId: activeSession?.id,
      };
    });
}

export function getAvailableStaff(
  staffMembers: AvailabilityStaff[],
  washSessions: AvailabilitySession[],
): StaffAvailability[] {
  return getStaffAvailability(staffMembers, washSessions).filter(
    (staff) => staff.availability === "Available",
  );
}

export function requireAvailableStaff(
  staffMembers: AvailabilityStaff[],
  washSessions: AvailabilitySession[],
): StaffAvailability {
  const staff = getAvailableStaff(staffMembers, washSessions)[0];
  if (!staff) {
    throw new Error(NO_AVAILABLE_STAFF_MESSAGE);
  }
  return staff;
}

export function assignStaffToConfirmedBooking(
  bookingId: string,
  staffRecords: DispatchStaffRecord[],
  random: () => number = Math.random,
): BookingStaffAssignment {
  void bookingId;
  const eligibleStaff = staffRecords.filter(
    (staff) => staff.status === "active" && staff.availability,
  );

  if (eligibleStaff.length === 0) {
    throw new StaffAssignmentError();
  }

  const belowTargetStaff = eligibleStaff.filter((staff) => staff.dailyWashCount < 10);
  const prioritizedPool = belowTargetStaff.length > 0 ? belowTargetStaff : eligibleStaff;
  const lowestWashCount = Math.min(...prioritizedPool.map((staff) => staff.dailyWashCount));
  const lowestCountStaff = prioritizedPool.filter(
    (staff) => staff.dailyWashCount === lowestWashCount,
  );

  if (lowestCountStaff.length === 1) {
    const winner = lowestCountStaff[0];
    return {
      assignedStaffId: winner.staffId,
      assignedStaffName: winner.name,
      washCountAtAssignment: winner.dailyWashCount,
      selectionMethod: "lowest_count",
      eligibleStaffCount: eligibleStaff.length,
      reason: "SUCCESS",
    };
  }

  const winnerIndex = Math.floor(random() * lowestCountStaff.length);
  const winner = lowestCountStaff[Math.max(0, Math.min(winnerIndex, lowestCountStaff.length - 1))];

  return {
    assignedStaffId: winner.staffId,
    assignedStaffName: winner.name,
    washCountAtAssignment: winner.dailyWashCount,
    selectionMethod: "random_tiebreak",
    eligibleStaffCount: eligibleStaff.length,
    reason: "SUCCESS",
  };
}
