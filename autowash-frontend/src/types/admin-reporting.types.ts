export type AdminBookingResponse = {
  bookingId: string;
  confirmationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  servicePackageId: string;
  servicePackageName: string;
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

export type AdminBookingListPage = {
  items: AdminBookingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};
