import type { ServicePackage } from "./customer.types";

export type BookingStatus =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type BookingMode = "SINGLE_PACKAGE" | "COMBO";
export type PaymentMethod = "CASH_AT_COUNTER" | "BANK_TRANSFER" | "E_WALLET";
export type PaymentStatus = "PAY_AT_COUNTER" | "PAID";

export interface BookingVehicleSnapshot {
  vehicleId: string;
  licensePlate: string;
  brand: string;
  model: string;
  vehicleType: string;
}

export interface BookingPackageSnapshot {
  packageId: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface BookingAddonSnapshot {
  addonId: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface BookingPaymentSnapshot {
  originalPrice: number;
  addOnTotal: number;
  comboUpgradeAmount?: number;
  comboUpgradeName?: string;
  voucherId?: string;
  voucherCode?: string;
  voucherLabel?: string;
  voucherDiscount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidViaCombo: boolean;
  finalAmount: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  vehicle: BookingVehicleSnapshot;
  package: BookingPackageSnapshot;
  addOns: BookingAddonSnapshot[];
  mode: BookingMode;
  comboId?: string;
  comboName?: string;
  remainingComboUsesAtBooking?: number;
  scheduledDate: string;
  scheduledTime: string;
  note?: string;
  status: BookingStatus;
  payment: BookingPaymentSnapshot;
  createdAt: string;
}

export interface BookingSelection {
  mode: BookingMode;
  vehicleId: string;
  packageId: string;
  scheduledDate: string;
  scheduledTime: string;
  note: string;
  voucherId: string;
  addonIds: string[];
  comboUpgradePackageId?: string;
  comboUpgradeAmount?: number;
  paymentMethod: PaymentMethod | "";
  useActiveCombo: boolean;
}

export interface BookingSummary {
  vehicleLabel: string;
  package: ServicePackage;
  scheduledDate: string;
  scheduledTime: string;
  note?: string;
  originalPrice: number;
  addOns: BookingAddonSnapshot[];
  addOnTotal: number;
  comboUpgradeAmount: number;
  comboUpgradeName?: string;
  voucherId?: string;
  voucherCode?: string;
  voucherLabel?: string;
  voucherDiscount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidViaCombo: boolean;
  finalAmount: number;
}
