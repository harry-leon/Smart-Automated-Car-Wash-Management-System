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

export type AdminBookingsPage = {
  items: AdminBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};
