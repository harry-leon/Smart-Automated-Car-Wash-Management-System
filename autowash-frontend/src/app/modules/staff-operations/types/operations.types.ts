import type { StaffBookingStatus } from "./status.types";

export type OperationsTimeFilter = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";

export interface StaffOption {
  id: string;
  name: string;
}

export interface OperationHourOption {
  value: string;
  label: string;
}

export interface PointTransactionMock {
  id: string;
  createdAt: string;
  pointsEarned: number;
  description: string;
}

export interface OperationBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  servicePackage: string;
  packageDurationMinutes: number;
  customerNote?: string;
  assignedStaffId: string;
  assignedStaff: string;
  scheduledAt: string;
  checkinTime?: string;
  estimatedFinishTime?: string;
  completedTime?: string;
  status: StaffBookingStatus;
  pointTransaction?: PointTransactionMock;
}

export interface OperationFilters {
  status: StaffBookingStatus | "ALL";
  time: OperationsTimeFilter;
  hour: string;
  staffId: string;
}
