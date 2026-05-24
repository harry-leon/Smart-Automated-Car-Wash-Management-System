export type BookingStatus =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface KpiMetric {
  id: string;
  label: string;
  value: number | string;
  delta: number;
  unit?: string;
  icon: "Calendar" | "CheckCircle2" | "AlertTriangle" | "Coins" | "Sparkles";
  tone: "primary" | "success" | "warning" | "info" | "purple";
}

export interface AdminBookingRow {
  id: string;
  code: string;
  customerName: string;
  vehiclePlate: string;
  servicePackage: string;
  scheduledTime: string;
  status: BookingStatus;
  staffName: string;
  checkInTime: string;
  assignedStaffId?: string;
  sessionId?: string;
  sessionStatus?: string;
}
