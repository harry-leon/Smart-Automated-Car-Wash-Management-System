import type { BrandModelCatalog, Vehicle, VehicleBrand, VehicleType } from "../types/vehicle.types";

export const brandModelCatalog: BrandModelCatalog = {
  Toyota: [
    { model: "Camry", vehicleType: "Sedan" },
    { model: "RAV4", vehicleType: "SUV" },
    { model: "Hilux", vehicleType: "Pickup" },
  ],
  Honda: [
    { model: "Civic", vehicleType: "Sedan" },
    { model: "CR-V", vehicleType: "SUV" },
    { model: "Jazz", vehicleType: "Hatchback" },
  ],
  Ford: [
    { model: "Ranger", vehicleType: "Pickup" },
    { model: "Everest", vehicleType: "SUV" },
    { model: "Transit", vehicleType: "Van" },
  ],
  Hyundai: [
    { model: "Accent", vehicleType: "Sedan" },
    { model: "Tucson", vehicleType: "SUV" },
    { model: "Stargazer", vehicleType: "Van" },
  ],
  "Mercedes-Benz": [
    { model: "C-Class", vehicleType: "Sedan" },
    { model: "GLC", vehicleType: "SUV" },
    { model: "Vito", vehicleType: "Van" },
  ],
};

export const vehicleBrands = Object.keys(brandModelCatalog) as VehicleBrand[];

export const vehicleImageFallbackByType: Record<VehicleType, string> = {
  Sedan:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85",
  SUV: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85",
  Pickup:
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85",
  Hatchback:
    "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=85",
  Van: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=85",
};

export const mockVehicles: Vehicle[] = [
  {
    id: "veh-001",
    licensePlate: "51G-246.80",
    brand: "Toyota",
    model: "Camry",
    vehicleType: "Sedan",
    color: "Pearl White",
    imageUrl: vehicleImageFallbackByType.Sedan,
    isDefault: true,
  },
  {
    id: "veh-002",
    licensePlate: "51H-888.19",
    brand: "Honda",
    model: "CR-V",
    vehicleType: "SUV",
    color: "Graphite Gray",
    imageUrl: vehicleImageFallbackByType.SUV,
    isDefault: false,
  },
  {
    id: "veh-003",
    licensePlate: "60A-112.35",
    brand: "Ford",
    model: "Ranger",
    vehicleType: "Pickup",
    color: "Velocity Blue",
    imageUrl: vehicleImageFallbackByType.Pickup,
    isDefault: false,
  },
];
