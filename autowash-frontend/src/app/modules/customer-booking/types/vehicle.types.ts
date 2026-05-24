export type VehicleType = "Sedan" | "SUV" | "Hatchback" | "Pickup" | "Van";

export type VehicleBrand = "Toyota" | "Honda" | "Ford" | "Hyundai" | "Mercedes-Benz";

export interface VehicleModelOption {
  model: string;
  vehicleType: VehicleType;
}

export type BrandModelCatalog = Record<VehicleBrand, VehicleModelOption[]>;

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: VehicleBrand;
  model: string;
  vehicleType: VehicleType;
  color: string;
  imageUrl?: string;
  isDefault: boolean;
}

export interface VehicleFormValues {
  licensePlate: string;
  brand: VehicleBrand;
  model: string;
  vehicleType: VehicleType;
  color: string;
  imageUrl?: string;
  isDefault: boolean;
}
