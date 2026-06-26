import { apiClient, apiRequest } from "@/shared/lib/api";
import type { ApiSuccessResponse } from "@/shared/types/api.types";
import type {
  AdminCatalogPackage,
  AdminCatalogService,
  AdminCombo,
  AdminComboForm,
} from "@/features/admin/management/management.types";

function getMockServices(): AdminCatalogService[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_admin_services");
  return stored ? JSON.parse(stored) : [];
}

function saveMockServices(services: AdminCatalogService[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_admin_services", JSON.stringify(services));
}

function getDeletedServiceIds(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_deleted_services");
  return stored ? JSON.parse(stored) : [];
}

function saveDeletedServiceIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_deleted_services", JSON.stringify(ids));
}

function getMockPackages(): AdminCatalogPackage[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_admin_packages");
  return stored ? JSON.parse(stored) : [];
}

function saveMockPackages(packages: AdminCatalogPackage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_admin_packages", JSON.stringify(packages));
}

function getDeletedPackageIds(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_deleted_packages");
  return stored ? JSON.parse(stored) : [];
}

function saveDeletedPackageIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_deleted_packages", JSON.stringify(ids));
}

export async function listAdminCatalogServices() {
  const response = await apiClient.get<ApiSuccessResponse<AdminCatalogService[]>>("/services");
  const backendServices = response.data.data;
  const added = getMockServices();
  const deletedIds = getDeletedServiceIds();
  return [
    ...backendServices.filter((s) => !deletedIds.includes(s.serviceId)),
    ...added,
  ];
}

export async function listAdminCatalogPackages() {
  const response = await apiClient.get<ApiSuccessResponse<AdminCatalogPackage[]>>("/packages");
  const backendPackages = response.data.data;
  const added = getMockPackages();
  const deletedIds = getDeletedPackageIds();
  return [
    ...backendPackages.filter((p) => !deletedIds.includes(p.packageId)),
    ...added,
  ];
}

export async function createAdminService(payload: {
  name: string;
  description: string;
  price: number;
  duration: number;
  status: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newService: AdminCatalogService = {
    serviceId: `mock-srv-${Date.now()}`,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    duration: payload.duration,
    status: payload.status,
  };
  const current = getMockServices();
  saveMockServices([...current, newService]);
  return newService;
}

export async function deleteAdminService(serviceId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (serviceId.startsWith("mock-srv-")) {
    const current = getMockServices();
    saveMockServices(current.filter((s) => s.serviceId !== serviceId));
  } else {
    const currentDeleted = getDeletedServiceIds();
    if (!currentDeleted.includes(serviceId)) {
      saveDeletedServiceIds([...currentDeleted, serviceId]);
    }
  }
}

export async function createAdminPackage(payload: {
  name: string;
  description: string;
  basePrice: number;
  duration: number;
  category: string;
  features: string[];
  status: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newPkg: AdminCatalogPackage = {
    packageId: `mock-pkg-${Date.now()}`,
    name: payload.name,
    description: payload.description,
    basePrice: payload.basePrice,
    duration: payload.duration,
    category: payload.category,
    features: payload.features,
    image: null,
    status: payload.status,
    popularity: null,
  };
  const current = getMockPackages();
  saveMockPackages([...current, newPkg]);
  return newPkg;
}

export async function deleteAdminPackage(packageId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (packageId.startsWith("mock-pkg-")) {
    const current = getMockPackages();
    saveMockPackages(current.filter((p) => p.packageId !== packageId));
  } else {
    const currentDeleted = getDeletedPackageIds();
    if (!currentDeleted.includes(packageId)) {
      saveDeletedPackageIds([...currentDeleted, packageId]);
    }
  }
}

export async function listAdminCombos() {
  const response = await apiClient.get<ApiSuccessResponse<AdminCombo[]>>("/admin/combos");
  return response.data.data;
}

export function createAdminCombo(payload: AdminComboForm) {
  return apiRequest<AdminCombo, Record<string, unknown>>({
    method: "POST",
    url: "/admin/combos",
    data: {
      name: payload.name,
      description: payload.description || null,
      price: Number(payload.price),
      originalPrice: payload.originalPrice ? Number(payload.originalPrice) : null,
      durationMinutes: Number(payload.durationMinutes),
      durationDays: payload.durationDays ? Number(payload.durationDays) : null,
      maxUsages: payload.maxUsages ? Number(payload.maxUsages) : null,
      imageUrl: payload.imageUrl || null,
      status: payload.status,
      options: payload.optionIds.map((optionId, index) => ({
        optionId,
        quantity: 1,
        sortOrder: index + 1,
      })),
    },
  });
}

export function deleteAdminCombo(comboId: string) {
  return apiRequest<AdminCombo>({
    method: "DELETE",
    url: `/admin/combos/${comboId}`,
  });
}
