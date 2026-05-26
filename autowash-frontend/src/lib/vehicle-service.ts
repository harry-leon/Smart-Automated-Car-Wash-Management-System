import { apiClient, apiRequest } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type {
  CreateCustomerVehicleRequest,
  CreateCustomerVehicleResponse,
  CustomerVehicleDetail,
  CustomerVehicleListItem,
  CustomerVehicleListPage,
  SetPrimaryCustomerVehicleResponse,
  UpdateCustomerVehicleRequest,
  UpdateCustomerVehicleResponse,
} from "@/types/vehicle.types";

export async function listCustomerVehicles({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<CustomerVehicleListPage> {
  const response = await apiClient.get<ApiPaginatedResponse<CustomerVehicleListItem>>(
    "/customers/vehicles",
    {
      params: { page, limit },
    },
  );

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export function getCustomerVehicle(vehicleId: string) {
  return apiRequest<CustomerVehicleDetail>({
    method: "GET",
    url: `/customers/vehicles/${vehicleId}`,
  });
}

export function createCustomerVehicle(payload: CreateCustomerVehicleRequest) {
  return apiRequest<CreateCustomerVehicleResponse, CreateCustomerVehicleRequest>({
    method: "POST",
    url: "/customers/vehicles",
    data: payload,
  });
}

export function updateCustomerVehicle(vehicleId: string, payload: UpdateCustomerVehicleRequest) {
  return apiRequest<UpdateCustomerVehicleResponse, UpdateCustomerVehicleRequest>({
    method: "PUT",
    url: `/customers/vehicles/${vehicleId}`,
    data: payload,
  });
}

export function setPrimaryCustomerVehicle(vehicleId: string) {
  return apiRequest<SetPrimaryCustomerVehicleResponse>({
    method: "POST",
    url: `/customers/vehicles/${vehicleId}/set-primary`,
  });
}

export async function deleteCustomerVehicle(vehicleId: string) {
  await apiClient.delete(`/customers/vehicles/${vehicleId}`);
}
