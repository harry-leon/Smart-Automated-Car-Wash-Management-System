export type AdminCatalogService = {
  serviceId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: string;
};

export type AdminCatalogPackage = {
  packageId: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number;
  category: string;
  features: string[];
  image: string | null;
  status: string;
  popularity: string | null;
};

export type AdminCombo = {
  comboId: string;
  name: string;
  description: string;
  basePrice: number;
  durationDays: number;
  maxServices: number;
  benefits: string[];
  image: string | null;
  isActive: boolean;
  canUpgrade: boolean;
  upgradePriceFrom: number;
};

export type AdminComboForm = {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  durationMinutes: string;
  durationDays: string;
  maxUsages: string;
  imageUrl: string;
  status: "ACTIVE" | "INACTIVE";
  optionIds: string[];
};

export type AdminServiceForm = {
  name: string;
  description: string;
  price: string;
  duration: string;
  status: "ACTIVE" | "INACTIVE";
};

export type AdminPackageForm = {
  name: string;
  description: string;
  basePrice: string;
  duration: string;
  category: string;
  features: string;
  status: "ACTIVE" | "INACTIVE";
};
