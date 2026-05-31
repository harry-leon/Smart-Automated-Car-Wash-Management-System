export const CUSTOMER_VEHICLE_TYPES = ["CAR", "SUV", "TRUCK", "MOTORBIKE", "VAN"] as const;

export type CustomerVehicleType = (typeof CUSTOMER_VEHICLE_TYPES)[number];

export type CustomerVehicleListItem = {
  vehicleId: string;
  plate: string;
  type: CustomerVehicleType;
  brand: string;
  model: string;
  color: string | null;
  isPrimary: boolean;
  status: string;
};

export type CustomerVehicleDetail = {
  vehicleId: string;
  customerId: string;
  plate: string;
  type: CustomerVehicleType;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  status: string;
  isPrimary: boolean;
  createdAt: string;
};

export type CreateCustomerVehicleRequest = {
  plate: string;
  type: CustomerVehicleType;
  brand: string;
  model: string;
  year: number;
  color: string | null;
};

export type CreateCustomerVehicleResponse = CustomerVehicleDetail;

export type UpdateCustomerVehicleRequest = {
  brand: string;
  model: string;
  year: number;
  color: string | null;
};

export type UpdateCustomerVehicleResponse = {
  vehicleId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  updatedAt: string;
};

export type SetPrimaryCustomerVehicleResponse = {
  vehicleId: string;
  plate: string;
  isPrimary: boolean;
  updatedAt: string;
};

export type CustomerVehicleListPage = {
  items: CustomerVehicleListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type CustomerVehicleFormValues = {
  plate: string;
  type: CustomerVehicleType;
  brand: string;
  model: string;
  year: string;
  color: string;
};

export type CustomerVehicleFormErrors = Partial<Record<keyof CustomerVehicleFormValues, string>>;
