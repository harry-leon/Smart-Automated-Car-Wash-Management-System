export type CustomerTier = "MEMBER" | "SILVER" | "GOLD" | "DIAMOND" | "N/A";
export type CustomerRole = "CUSTOMER" | "ADMIN" | "STAFF";
export type CustomerStatus = "ACTIVE" | "SUSPENDED";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: CustomerTier;
  availablePoints: number;
  lifetimePoints: number;
  role: CustomerRole;
  status: CustomerStatus;
  joinedAt: string;
  accountType: "CUSTOMER" | "STAFF" | "ADMIN";
}

export interface CustomerVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  year: number;
}

export interface CustomerBookingItem {
  id: string;
  code: string;
  servicePackage: string;
  scheduledTime: string;
  status: import("./dashboard.types").BookingStatus;
  totalAmount: number;
}

export interface WashHistoryItem {
  id: string;
  bookingCode: string;
  servicePackage: string;
  completedAt: string;
  staffName: string;
  rating: number;
  amount: number;
}

export type PointTransactionType = "EARN" | "REDEEM" | "ADJUST" | "EXPIRE" | "REFUND";

export interface PointTransaction {
  id: string;
  customerId?: string;
  customerName?: string;
  bookingCode: string;
  type: PointTransactionType;
  amount: number;
  availableAfter: number;
  lifetimeAfter: number;
  createdAt: string;
  note?: string;
}

export interface TierHistoryItem {
  id: string;
  customerId?: string;
  customerName?: string;
  fromTier: CustomerTier;
  toTier: CustomerTier;
  changedAt: string;
  reason: string;
}
