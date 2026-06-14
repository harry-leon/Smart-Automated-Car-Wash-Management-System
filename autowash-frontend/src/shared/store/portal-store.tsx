import { useCarwashStore, Vehicle, VehicleType, Tier, CustomerStatus } from "@/shared/store/carwash-store";

export type { Vehicle, VehicleType, Tier };

export interface Profile {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  tier: Tier;
  points: number;
  status: CustomerStatus;
  joinedAt: string;
  phoneVerifiedAt: string;
  bookingSuspendedUntil?: string;
}

export function nextTierInfo(points: number, tier: Tier) {
  const { tiers } = useCarwashStore();
  const sorted = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
  const currentIndex = sorted.findIndex((rule) => rule.name === tier);
  const next = sorted[currentIndex + 1];
  if (!next) {
    return { next: null as Tier | null, needed: 0, current: points, target: points, pct: 100 };
  }
  const base = sorted[currentIndex]?.minPoints ?? 0;
  return {
    next: next.name,
    needed: Math.max(0, next.minPoints - points),
    current: points,
    target: next.minPoints,
    pct: Math.min(100, Math.round(((points - base) / (next.minPoints - base)) * 100)),
  };
}

export function usePortal() {
  const store = useCarwashStore();
  const customer = store.customers.find((item) => item.id === store.currentCustomerId);

  return {
    profile: customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          countryCode: customer.countryCode,
          tier: customer.tier,
          points: customer.points,
          status: customer.status,
          joinedAt: customer.joinedAt,
          phoneVerifiedAt: customer.phoneVerifiedAt,
          bookingSuspendedUntil: customer.bookingSuspendedUntil,
        }
      : null,
    vehicles: store.vehiclesByCustomer[store.currentCustomerId] ?? [],
    vehicleOwnershipHistory: store.vehicleOwnershipHistory.filter(
      (entry) =>
        entry.newCustomerId === customer?.id ||
        entry.previousCustomerId === customer?.id ||
        entry.newCustomerName === customer?.name ||
        entry.previousCustomerName === customer?.name,
    ),
    pending: store.pendingRegistration,
    pendingPhoneChange: store.pendingPhoneChange,
    setPending: store.setPendingRegistration,
    requestRegistrationOtp: store.requestRegistrationOtp,
    resendRegistrationOtp: store.resendRegistrationOtp,
    completeRegistration: store.completeRegistration,
    requestPhoneChange: store.requestPhoneChange,
    resendPhoneChangeOtp: store.resendPhoneChangeOtp,
    confirmPhoneChange: store.confirmPhoneChange,
    updateProfile: store.updateCurrentProfile,
    addVehicle: store.addVehicle,
    updateVehicle: store.updateVehicle,
    deleteVehicle: store.deleteVehicle,
  };
}

export const VEHICLE_TYPES: VehicleType[] = ["Sedan", "SUV", "Truck", "Motorbike"];
