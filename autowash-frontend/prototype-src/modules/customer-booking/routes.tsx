import React, { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { Outlet } from "@tanstack/react-router";
import { mockBookings } from "./mock/booking.mock";
import {
  mockActiveCombo,
  mockComboPackages,
  mockCustomer,
  mockServiceAddons,
  mockServicePackages,
  mockVouchers,
} from "./mock/customer.mock";
import { mockPointTransactions } from "./mock/history.mock";
import { mockVehicles } from "./mock/vehicles.mock";
import type { Booking, BookingSelection, BookingSummary } from "./types/booking.types";
import type {
  ActiveCombo,
  ComboPackage,
  CustomerLanguage,
  CustomerProfile,
  ServiceAddon,
  ServicePackage,
  Voucher,
} from "./types/customer.types";
import type { PointTransaction } from "./types/history.types";
import type { Vehicle, VehicleFormValues } from "./types/vehicle.types";

export const customerBookingRoutes = {
  home: "/customer/home",
  vehicles: "/customer/vehicles",
  vehiclesNew: "/customer/vehicles",
  vehiclesEdit: "/customer/vehicles",
  booking: "/customer/bookings",
  historyBookings: "/customer/history",
  historyWashes: "/customer/history",
  historyPoints: "/customer/history",
} as const;

export type CustomerRouteKey = keyof typeof customerBookingRoutes;

interface CustomerBookingState {
  language: CustomerLanguage;
  customer: CustomerProfile;
  activeCombo: ActiveCombo | null;
  bookingDraft: Partial<BookingSelection>;
  servicePackages: ServicePackage[];
  serviceAddons: ServiceAddon[];
  comboPackages: ComboPackage[];
  vouchers: Voucher[];
  vehicles: Vehicle[];
  bookings: Booking[];
  pointTransactions: PointTransaction[];
}

interface ConfirmBookingResult {
  booking: Booking;
  pointTransaction?: PointTransaction;
}

interface BookingSyncOverride {
  bookingCode?: string;
  id?: string;
}

export interface CustomerBookingStore extends CustomerBookingState {
  setLanguage: (language: CustomerLanguage) => void;
  addVehicle: (values: VehicleFormValues) => Vehicle;
  updateVehicle: (id: string, values: VehicleFormValues) => Vehicle;
  deleteVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
  setBookingDraft: (draft: Partial<BookingSelection>) => void;
  clearBookingDraft: () => void;
  redeemPointsForVoucher: (points: number) => Voucher;
  upgradeActiveCombo: (comboPackageId: string) => ActiveCombo;
  confirmBooking: (
    selection: BookingSelection,
    summary: BookingSummary,
    override?: BookingSyncOverride,
  ) => ConfirmBookingResult;
}

type Listener = () => void;

const voucherValuePerPoint = 1000;
const minimumVoucherPoints = 50;
const maximumVoucherPoints = 200;
const maximumActivePointVouchers = 3;

function getInitialLanguage(): CustomerLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  return window.localStorage.getItem("customer-booking-language") === "vi" ? "vi" : "en";
}

let state: CustomerBookingState = {
  language: getInitialLanguage(),
  customer: { ...mockCustomer },
  activeCombo: { ...mockActiveCombo },
  bookingDraft: {},
  servicePackages: [...mockServicePackages],
  serviceAddons: [...mockServiceAddons],
  comboPackages: [...mockComboPackages],
  vouchers: [...mockVouchers],
  vehicles: [...mockVehicles],
  bookings: [...mockBookings],
  pointTransactions: [...mockPointTransactions],
};

const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(updater: (current: CustomerBookingState) => CustomerBookingState) {
  state = updater(state);
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function buildVehicle(values: VehicleFormValues, id = `veh-${Date.now()}`): Vehicle {
  return {
    id,
    licensePlate: values.licensePlate.trim().toUpperCase(),
    brand: values.brand,
    model: values.model,
    vehicleType: values.vehicleType,
    color: values.color.trim(),
    imageUrl: values.imageUrl,
    isDefault: values.isDefault,
  };
}

function createBookingCode() {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const nextNumber = String(state.bookings.length + 1).padStart(3, "0");
  return `CW-${datePart}-${nextNumber}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function getMembershipTier(lifetimePoints: number) {
  if (lifetimePoints >= 12000) return "Diamond";
  if (lifetimePoints >= 5000) return "Gold";
  return "Silver";
}

function isVoucherUsable(voucher: Voucher, customer: CustomerProfile, today = new Date()) {
  const expiresAt = new Date(`${voucher.expiresAt}T23:59:59`);

  return (
    voucher.ownerCustomerId === customer.id &&
    voucher.status === "ACTIVE" &&
    !voucher.disabled &&
    expiresAt >= today &&
    voucher.usedCount < voucher.usageLimit &&
    voucher.eligibleTiers.includes(customer.tier) &&
    (!voucher.newCustomersOnly || customer.isNewCustomer)
  );
}

const actions = {
  setLanguage(language: CustomerLanguage) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("customer-booking-language", language);
    }

    setState((current) => ({ ...current, language }));
  },
  addVehicle(values: VehicleFormValues) {
    const vehicle = buildVehicle(values);
    setState((current) => {
      const shouldDefault = vehicle.isDefault || current.vehicles.length === 0;
      const nextVehicle = { ...vehicle, isDefault: shouldDefault };
      return {
        ...current,
        vehicles: shouldDefault
          ? [...current.vehicles.map((item) => ({ ...item, isDefault: false })), nextVehicle]
          : [...current.vehicles, nextVehicle],
      };
    });
    return vehicle;
  },
  updateVehicle(id: string, values: VehicleFormValues) {
    const vehicle = buildVehicle(values, id);
    setState((current) => ({
      ...current,
      vehicles: current.vehicles.map((item) => {
        if (item.id === id) {
          return vehicle;
        }

        if (vehicle.isDefault) {
          return { ...item, isDefault: false };
        }

        return item;
      }),
    }));
    return vehicle;
  },
  deleteVehicle(id: string) {
    setState((current) => {
      const removedVehicle = current.vehicles.find((vehicle) => vehicle.id === id);
      const remainingVehicles = current.vehicles.filter((vehicle) => vehicle.id !== id);
      const vehicles =
        removedVehicle?.isDefault && remainingVehicles.length > 0
          ? remainingVehicles.map((vehicle, index) => ({ ...vehicle, isDefault: index === 0 }))
          : remainingVehicles;

      return { ...current, vehicles };
    });
  },
  setDefaultVehicle(id: string) {
    setState((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) => ({
        ...vehicle,
        isDefault: vehicle.id === id,
      })),
    }));
  },
  setBookingDraft(draft: Partial<BookingSelection>) {
    setState((current) => ({
      ...current,
      bookingDraft: {
        ...current.bookingDraft,
        ...draft,
      },
    }));
  },
  clearBookingDraft() {
    setState((current) => ({
      ...current,
      bookingDraft: {},
    }));
  },
  redeemPointsForVoucher(points: number) {
    const redeemPoints = Math.floor(points);
    const activePointVoucherCount = state.vouchers.filter(
      (voucher) => voucher.source === "POINT_REDEEM" && isVoucherUsable(voucher, state.customer),
    ).length;

    if (redeemPoints < minimumVoucherPoints) {
      throw new Error("Minimum redeem is 50 points.");
    }

    if (redeemPoints > maximumVoucherPoints) {
      throw new Error("Maximum redeem per voucher is 200 points.");
    }

    if (redeemPoints > state.customer.availablePoints) {
      throw new Error("Not enough available points.");
    }

    if (activePointVoucherCount >= maximumActivePointVouchers) {
      throw new Error("Only 3 active point vouchers are allowed at the same time.");
    }

    const now = new Date();
    const voucherValue = redeemPoints * voucherValuePerPoint;
    const voucher: Voucher = {
      id: `voucher-point-${Date.now()}`,
      code: `POINT${Math.round(voucherValue / 1000)}K`,
      systemCode: `SYS-POINT-${state.customer.id}-${Date.now()}`,
      ownerCustomerId: state.customer.id,
      label: `${redeemPoints} points voucher`,
      discountAmount: voucherValue,
      eligibleTiers: ["Silver", "Gold", "Diamond"],
      source: "POINT_REDEEM",
      status: "ACTIVE",
      expiresAt: addDays(now, 30),
      usageLimit: 1,
      usedCount: 0,
    };

    const pointTransaction: PointTransaction = {
      id: `pt-voucher-${Date.now()}`,
      type: "REDEEM",
      points: -redeemPoints,
      description: `Redeemed ${redeemPoints} points into ${voucherValue.toLocaleString()} VND voucher`,
      createdAt: now.toISOString(),
    };

    setState((current) => ({
      ...current,
      customer: {
        ...current.customer,
        availablePoints: Math.max(0, current.customer.availablePoints - redeemPoints),
      },
      vouchers: [voucher, ...current.vouchers],
      pointTransactions: [pointTransaction, ...current.pointTransactions],
    }));

    return voucher;
  },
  upgradeActiveCombo(comboPackageId: string) {
    const targetPackage = state.comboPackages.find(
      (comboPackage) => comboPackage.id === comboPackageId,
    );

    if (!targetPackage) {
      throw new Error("Selected combo package does not exist.");
    }

    const linkedVehicleId =
      state.activeCombo?.linkedVehicleId ??
      state.vehicles.find((vehicle) => vehicle.isDefault)?.id ??
      state.vehicles[0]?.id;

    if (!linkedVehicleId) {
      throw new Error("A vehicle is required before upgrading a combo package.");
    }

    const currentUses = state.activeCombo?.remainingUses ?? 0;
    const currentTotalUses = state.activeCombo?.totalUses ?? 0;
    const addedUses = Math.max(0, targetPackage.totalUses - currentTotalUses);
    const upgradedCombo: ActiveCombo = {
      id: state.activeCombo?.id ?? `active-combo-${Date.now()}`,
      comboPackageId: targetPackage.id,
      comboName: targetPackage.name,
      status: "ACTIVE",
      remainingUses: Math.min(targetPackage.totalUses, currentUses + addedUses),
      totalUses: targetPackage.totalUses,
      validUntil: addDays(new Date(), targetPackage.validityDays),
      linkedVehicleId,
      qrCodeText: `CW-UPGRADE-${String(Date.now()).slice(-6)}`,
    };

    const pointTransaction: PointTransaction = {
      id: `pt-upgrade-${Date.now()}`,
      type: "BONUS",
      points: 250,
      description: `Upgrade bonus for ${targetPackage.name}`,
      createdAt: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      activeCombo: upgradedCombo,
      customer: {
        ...current.customer,
        availablePoints: current.customer.availablePoints + pointTransaction.points,
        lifetimePoints: current.customer.lifetimePoints + pointTransaction.points,
      },
      pointTransactions: [pointTransaction, ...current.pointTransactions],
    }));

    return upgradedCombo;
  },
  confirmBooking(
    selection: BookingSelection,
    summary: BookingSummary,
    override?: BookingSyncOverride,
  ) {
    const vehicle = state.vehicles.find((item) => item.id === selection.vehicleId);

    if (!vehicle) {
      throw new Error("Selected vehicle no longer exists.");
    }

    const booking: Booking = {
      id: override?.id ?? `bk-${Date.now()}`,
      bookingCode: override?.bookingCode ?? createBookingCode(),
      vehicle: {
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        vehicleType: vehicle.vehicleType,
      },
      package: {
        packageId: summary.package.id,
        name: summary.package.name,
        price: summary.package.price,
        durationMinutes: summary.package.durationMinutes,
      },
      addOns: summary.addOns,
      mode: selection.mode,
      comboId: selection.useActiveCombo ? state.activeCombo?.id : undefined,
      comboName: selection.useActiveCombo ? state.activeCombo?.comboName : undefined,
      remainingComboUsesAtBooking: selection.useActiveCombo
        ? state.activeCombo?.remainingUses
        : undefined,
      scheduledDate: selection.scheduledDate,
      scheduledTime: selection.scheduledTime,
      note: selection.note.trim() || undefined,
      status: "CONFIRMED",
      payment: {
        originalPrice: summary.originalPrice,
        addOnTotal: summary.addOnTotal,
        comboUpgradeAmount: summary.comboUpgradeAmount || undefined,
        comboUpgradeName: summary.comboUpgradeName,
        voucherId: summary.voucherId,
        voucherCode: summary.voucherCode,
        voucherLabel: summary.voucherLabel,
        voucherDiscount: summary.voucherDiscount,
        paymentMethod: summary.paymentMethod,
        paymentStatus: summary.paymentStatus,
        paidViaCombo: summary.paidViaCombo,
        finalAmount: summary.finalAmount,
      },
      createdAt: new Date().toISOString(),
    };

    const upgradedComboPackage = selection.comboUpgradePackageId
      ? state.comboPackages.find(
          (comboPackage) => comboPackage.id === selection.comboUpgradePackageId,
        )
      : undefined;

    setState((current) => ({
      ...current,
      customer: {
        ...current.customer,
        tier: getMembershipTier(current.customer.lifetimePoints),
      },
      activeCombo: upgradedComboPackage
        ? {
            id: current.activeCombo?.id ?? `active-combo-${Date.now()}`,
            comboPackageId: upgradedComboPackage.id,
            comboName: upgradedComboPackage.name,
            status: "ACTIVE",
            remainingUses: upgradedComboPackage.totalUses,
            totalUses: upgradedComboPackage.totalUses,
            validUntil: addDays(new Date(), upgradedComboPackage.validityDays),
            linkedVehicleId: current.activeCombo?.linkedVehicleId ?? vehicle.id,
            qrCodeText: `CW-UPGRADE-${String(Date.now()).slice(-6)}`,
          }
        : current.activeCombo,
      bookings: [booking, ...current.bookings],
      vouchers: summary.voucherId
        ? current.vouchers.map((voucher) =>
            voucher.id === summary.voucherId
              ? { ...voucher, status: "USED", usedCount: voucher.usedCount + 1 }
              : voucher,
          )
        : current.vouchers,
      pointTransactions: current.pointTransactions,
    }));

    return { booking };
  },
};

const CustomerBookingContext = createContext<CustomerBookingStore | null>(null);

export function CustomerBookingProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const value = useMemo<CustomerBookingStore>(() => ({ ...snapshot, ...actions }), [snapshot]);

  return (
    <CustomerBookingContext.Provider value={value}>{children}</CustomerBookingContext.Provider>
  );
}

export function useCustomerBooking(): CustomerBookingStore {
  const context = useContext(CustomerBookingContext);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo<CustomerBookingStore>(
    () => context ?? { ...snapshot, ...actions },
    [context, snapshot],
  );
}

export function CustomerBookingModuleLayout() {
  return (
    <CustomerBookingProvider>
      <Outlet />
    </CustomerBookingProvider>
  );
}

export function getVoucherValue(points: number) {
  return points * voucherValuePerPoint;
}

export function getUsableVouchers(vouchers: Voucher[], customer: CustomerProfile) {
  return vouchers.filter((voucher) => isVoucherUsable(voucher, customer));
}

export const customerBookingRouteManifest = [
  { path: customerBookingRoutes.home, label: "Home" },
  { path: customerBookingRoutes.vehicles, label: "Vehicles" },
  { path: customerBookingRoutes.vehiclesNew, label: "Add Vehicle" },
  { path: customerBookingRoutes.vehiclesEdit, label: "Edit Vehicle" },
  { path: customerBookingRoutes.booking, label: "Booking" },
  { path: customerBookingRoutes.historyBookings, label: "Booking History" },
  { path: customerBookingRoutes.historyWashes, label: "Wash History" },
  { path: customerBookingRoutes.historyPoints, label: "Point Transactions" },
] as const;
