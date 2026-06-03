export type AdminBooking = {
  bookingId: string;
  confirmationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  servicePackageId: string | null;
  servicePackageName: string | null;
  bookingDate: string;
  bookingTime: string;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  sessionId: string | null;
  washStatus: string | null;
  createdAt: string;
};

export type AdminBookingsFilters = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  searchQuery?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type AdminAccountRole = "CUSTOMER" | "STAFF" | "ADMIN" | "GUEST";

export type AdminAccountStatus = "PENDING" | "ACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED";

export type AdminAccount = {
  accountId: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: AdminAccountRole;
  status: AdminAccountStatus;
  tier: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminAccountsFilters = {
  role?: AdminAccountRole;
  status?: AdminAccountStatus;
  searchQuery?: string;
};

export type AdminAccountsPage = {
  items: AdminAccount[];
  pagination: PaginationMeta;
};

export type AdminBookingsPage = {
  items: AdminBooking[];
  pagination: PaginationMeta;
};

export type AdminCustomerDetail = {
  customerId: string;
  profile: {
    fullName: string;
    phone: string;
    email: string | null;
    status: string;
    tier: string;
    registeredAt: string;
  };
  loyalty: {
    currentPoints: number;
    tier: string;
    updatedAt: string;
  };
  summary: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalWashSessions: number;
    totalSpent: number;
    totalPointsEarned: number;
    totalPointsSpent: number;
    lastBookingDate: string | null;
    lastBookingAmount: number | null;
  };
};

export type AdminCustomerVehicle = {
  vehicleId: string;
  plate: string;
  type: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  status: string;
  isPrimary: boolean;
  lastServiceDate: string | null;
  totalServices: number | null;
};

export type AdminCustomerVehiclesPage = {
  items: AdminCustomerVehicle[];
  pagination: PaginationMeta;
};

export type AdminTierHistoryItem = {
  id: string;
  fromTier: string | null;
  toTier: string;
  reason: string | null;
  pointsAtChange: number | null;
  changedAt: string;
};

export type AdminTierHistoryPage = {
  items: AdminTierHistoryItem[];
  pagination: PaginationMeta;
};

export type AdminWashHistoryItem = {
  sessionId: string;
  bookingId: string;
  vehiclePlate: string;
  servicePackage: {
    id: string | null;
    name: string | null;
  };
  status: string;
  bookingDate: string;
  bookingTime: string;
  startedAt: string | null;
  completedAt: string | null;
  fee: {
    amount: number | null;
    currency: string | null;
  };
  pointsAwarded: number | null;
};

export type AdminWashHistoryPage = {
  items: AdminWashHistoryItem[];
  pagination: PaginationMeta;
};

export type AdminPointTransaction = {
  transactionId: string;
  type: string;
  points: number;
  balanceAfter: number;
  reason: string;
  referenceId: string | null;
  createdAt: string;
};

export type AdminPointTransactionsPage = {
  items: AdminPointTransaction[];
  pagination: PaginationMeta;
};

export type AdminCustomerStatus = "ACTIVE" | "BLOCKED" | "SUSPENDED";

export type UpdateAdminCustomerStatusPayload = {
  status: AdminCustomerStatus;
  reason?: string;
};

export type UpdateAdminCustomerStatusResult = {
  customerId: string;
  status: string;
  updatedAt: string;
};
