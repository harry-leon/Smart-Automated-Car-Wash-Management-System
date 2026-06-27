import type { VehicleCatalogBrand } from "@/entities/vehicles";

export const VEHICLE_CATALOG: VehicleCatalogBrand[] = [
  {
    name: "Toyota",
    models: [
      { name: "Vios", type: "CAR" },
      { name: "Corolla Cross", type: "SUV" },
      { name: "Fortuner", type: "SUV" },
    ],
  },
  {
    name: "Honda",
    models: [
      { name: "City", type: "CAR" },
      { name: "Civic", type: "CAR" },
      { name: "CR-V", type: "SUV" },
    ],
  },
  {
    name: "Mazda",
    models: [
      { name: "Mazda2", type: "CAR" },
      { name: "Mazda3", type: "CAR" },
      { name: "CX-5", type: "SUV" },
    ],
  },
  {
    name: "Kia",
    models: [
      { name: "Morning", type: "CAR" },
      { name: "Seltos", type: "SUV" },
      { name: "Carnival", type: "SUV" },
    ],
  },
  {
    name: "Hyundai",
    models: [
      { name: "Accent", type: "CAR" },
      { name: "Creta", type: "SUV" },
      { name: "Staria", type: "SUV" },
    ],
  },
  {
    name: "Mercedes-Benz",
    models: [
      { name: "C200", type: "CAR" },
      { name: "GLC", type: "SUV" },
    ],
  },
  {
    name: "BMW",
    models: [
      { name: "320i", type: "CAR" },
      { name: "X5", type: "SUV" },
      { name: "X7", type: "SUV" },
    ],
  },
];

export function findBrand(name: string) {
  return VEHICLE_CATALOG.find((brand) => brand.name === name) ?? null;
}

export function findModel(brandName: string, modelName: string) {
  return findBrand(brandName)?.models.find((model) => model.name === modelName) ?? null;
}

export function getVehicleCatalogBrands() {
  return VEHICLE_CATALOG;
}
