export type WashSessionStatus =
  | "PENDING"
  | "QUEUED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type OperationsQueueSummary = {
  total: number;
  pending: number;
  checkedIn: number;
  inProgress: number;
  completed: number;
};

export type OperationsQueueSession = {
  sessionId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  packageId?: string | null;
  servicePackage?: string | null;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  status: WashSessionStatus;
  bookingDate: string;
  bookingTime: string;
  estimatedDurationMinutes?: number | null;
  feeAmount?: number | null;
  feeCurrency?: string | null;
  projectedLoyaltyPoints?: number | null;
  awardedLoyaltyPoints?: number | null;
  queuedAt?: string | null;
  checkedInAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type OperationsQueueColumn = {
  status: WashSessionStatus;
  label: string;
  sessions: OperationsQueueSession[];
};

export type OperationsQueue = {
  summary: OperationsQueueSummary;
  columns: OperationsQueueColumn[];
  generatedAt: string;
};

export type QueueWashSessionResponse = {
  sessionId: string;
  status: WashSessionStatus;
  queuedAt: string;
};

export type CheckInWashSessionResponse = {
  sessionId: string;
  status: WashSessionStatus;
  checkedInAt: string;
  fee: {
    amount: number;
    currency: string;
  };
  projectedLoyaltyPoints: number;
};

export type StartWashSessionResponse = {
  sessionId: string;
  status: WashSessionStatus;
  startedAt: string;
};

export type CompleteWashSessionResponse = {
  sessionId: string;
  status: WashSessionStatus;
  completedAt: string;
  awardedLoyaltyPoints: number;
};
