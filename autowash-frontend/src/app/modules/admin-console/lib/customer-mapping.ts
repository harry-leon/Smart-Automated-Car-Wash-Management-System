import type {
  AuthAccount,
  Booking,
  CustomerRecord,
  LedgerEntry,
  StaffRecord,
  Tier,
  Vehicle,
} from "@/lib/carwash-store";
import type {
  CustomerBookingItem,
  CustomerRow,
  CustomerStatus,
  CustomerTier,
  CustomerVehicle,
  PointTransaction,
  PointTransactionType,
  WashHistoryItem,
} from "../types/customer.types";
import type { BookingStatus as DashboardBookingStatus } from "../types/dashboard.types";

const TIER_MAP: Record<Tier, CustomerTier> = {
  Member: "MEMBER",
  Silver: "SILVER",
  Gold: "GOLD",
  Platinum: "DIAMOND",
};

export function tierToDisplay(tier: Tier): CustomerTier {
  return TIER_MAP[tier] ?? "MEMBER";
}

export function displayTierToStore(tier: CustomerTier): Tier {
  switch (tier) {
    case "SILVER":
      return "Silver";
    case "GOLD":
      return "Gold";
    case "DIAMOND":
      return "Platinum";
    default:
      return "Member";
  }
}

export function statusToDisplay(status: CustomerRecord["status"]): CustomerStatus {
  return status === "Active" ? "ACTIVE" : "SUSPENDED";
}

export function displayStatusToStore(status: CustomerStatus): CustomerRecord["status"] {
  return status === "ACTIVE" ? "Active" : "Blocked";
}

function lifetimePointsFor(customerId: string, ledger: LedgerEntry[]) {
  return ledger
    .filter(
      (entry) => entry.customerId === customerId && entry.type === "Earned" && entry.delta > 0,
    )
    .reduce((sum, entry) => sum + entry.delta, 0);
}

export function storeCustomersToRows(
  customers: CustomerRecord[],
  ledger: LedgerEntry[],
): CustomerRow[] {
  return customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: `${customer.countryCode} ${customer.phone}`,
    tier: tierToDisplay(customer.tier),
    availablePoints: customer.points,
    lifetimePoints: Math.max(customer.points, lifetimePointsFor(customer.id, ledger)),
    role: "CUSTOMER",
    status: statusToDisplay(customer.status),
    joinedAt: customer.joinedAt,
    accountType: "CUSTOMER",
  }));
}

export function storeAccountsToRows(
  customers: CustomerRecord[],
  staffMembers: StaffRecord[],
  authAccounts: AuthAccount[],
  ledger: LedgerEntry[],
): CustomerRow[] {
  const customerRows = storeCustomersToRows(customers, ledger);

  const staffRows = staffMembers.map((staff) => {
    const authAccount = authAccounts.find(
      (account) =>
        account.staffId === staff.id ||
        (account.role === staff.role && account.staffId === staff.id),
    );
    return {
      id: staff.id,
      name: staff.name,
      email: authAccount?.emailOrPhone.includes("@") ? authAccount.emailOrPhone : "N/A",
      phone: authAccount?.emailOrPhone.includes("@") ? "N/A" : (authAccount?.emailOrPhone ?? "N/A"),
      tier: "N/A" as const,
      availablePoints: 0,
      lifetimePoints: 0,
      role: staff.role === "Admin" ? "ADMIN" : "STAFF",
      status: staff.status === "Active" ? "ACTIVE" : "SUSPENDED",
      joinedAt: "System account",
      accountType: staff.role === "Admin" ? "ADMIN" : "STAFF",
    };
  });

  const adminRows = authAccounts
    .filter((account) => account.role === "Admin")
    .map((account) => ({
      id: account.id,
      name: "Admin User",
      email: account.emailOrPhone.includes("@") ? account.emailOrPhone : "N/A",
      phone: account.emailOrPhone.includes("@") ? "N/A" : account.emailOrPhone,
      tier: "N/A" as const,
      availablePoints: 0,
      lifetimePoints: 0,
      role: "ADMIN" as const,
      status: "ACTIVE" as const,
      joinedAt: "System account",
      accountType: "ADMIN" as const,
    }));

  return [...customerRows, ...staffRows, ...adminRows];
}

export function vehicleToDisplay(vehicle: Vehicle): CustomerVehicle {
  const [brand, ...rest] = vehicle.brandModel.split(" ");
  return {
    id: vehicle.id,
    plate: vehicle.plate,
    brand: brand ?? vehicle.brandModel,
    model: rest.join(" ") || vehicle.type,
    color: vehicle.color ?? "—",
    year: new Date().getFullYear(),
  };
}

const STORE_TO_DASHBOARD_STATUS: Record<Booking["status"], DashboardBookingStatus> = {
  Pending: "CONFIRMED",
  Confirmed: "CONFIRMED",
  "Checked-in": "CHECKED_IN",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
  "No-show": "NO_SHOW",
};

export function bookingToDisplay(booking: Booking): CustomerBookingItem {
  const status =
    booking.washStatus === "In Progress" && booking.status === "Checked-in"
      ? "IN_PROGRESS"
      : STORE_TO_DASHBOARD_STATUS[booking.status];
  return {
    id: booking.id,
    code: booking.id,
    servicePackage: booking.services.join(", "),
    scheduledTime: booking.scheduledAt,
    status,
    totalAmount: booking.totalPrice,
  };
}

export function completedBookingToHistory(booking: Booking): WashHistoryItem {
  return {
    id: booking.id,
    bookingCode: booking.id,
    servicePackage: booking.services.join(", "),
    completedAt: booking.completedAt ?? booking.scheduledAt,
    staffName: "Carwash team",
    rating: 5,
    amount: booking.checkoutAmount ?? booking.totalPrice,
  };
}

const LEDGER_TO_POINT_TYPE: Record<LedgerEntry["type"], PointTransactionType> = {
  Earned: "EARN",
  Spent: "REDEEM",
  Adjusted: "ADJUST",
};

export function ledgerEntryToPointTx(entry: LedgerEntry): PointTransaction {
  return {
    id: entry.id,
    customerId: entry.customerId,
    bookingCode: entry.description,
    type: LEDGER_TO_POINT_TYPE[entry.type] ?? "ADJUST",
    amount: entry.delta,
    availableAfter: 0,
    lifetimeAfter: 0,
    createdAt: entry.date,
    note: entry.expiresAt ? `Expires ${entry.expiresAt}` : undefined,
  };
}
