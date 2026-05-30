import { apiClient, apiRequest } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type {
  AdminBooking,
  AdminBookingsFilters,
  AdminBookingsPage,
  AdminCustomerDetail,
  AdminCustomerVehiclesPage,
  AdminPointTransaction,
  AdminPointTransactionsPage,
  AdminTierHistoryItem,
  AdminTierHistoryPage,
  AdminWashHistoryItem,
  AdminWashHistoryPage,
  AdminCustomerVehicle,
  UpdateAdminCustomerStatusPayload,
  UpdateAdminCustomerStatusResult,
} from "@/types/admin-reporting.types";

export async function listAdminBookings(
  filters: AdminBookingsFilters,
  page = 1,
  limit = 20,
): Promise<AdminBookingsPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminBooking>>("/admin/bookings", {
    params: {
      ...filters,
      page,
      limit,
    },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getAdminCustomerDetail(customerId: string): Promise<AdminCustomerDetail> {
  const response = await apiClient.get(`/admin/customers/${customerId}`);
  return response.data.data;
}

export async function listAdminCustomerVehicles(
  customerId: string,
  params: { page?: number; limit?: number } = {},
): Promise<AdminCustomerVehiclesPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminCustomerVehicle>>(
    `/admin/customers/${customerId}/vehicles`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    },
  );

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function listAdminCustomerTierHistory(
  customerId: string,
  params: { page?: number; limit?: number } = {},
): Promise<AdminTierHistoryPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminTierHistoryItem>>(
    `/admin/customers/${customerId}/tier-history`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    },
  );

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function listAdminCustomerWashHistory(
  customerId: string,
  params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<AdminWashHistoryPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminWashHistoryItem>>(
    `/admin/customers/${customerId}/wash-sessions`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        dateFrom: normalizeDateTimeParam(params.dateFrom),
        dateTo: normalizeDateTimeParam(params.dateTo),
      },
    },
  );

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function listAdminCustomerPointTransactions(
  customerId: string,
  params: {
    page?: number;
    limit?: number;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<AdminPointTransactionsPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminPointTransaction>>(
    `/admin/customers/${customerId}/point-transactions`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        type: params.type,
        dateFrom: normalizeDateTimeParam(params.dateFrom),
        dateTo: normalizeDateTimeParam(params.dateTo),
      },
    },
  );

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export function updateAdminCustomerStatus(
  customerId: string,
  payload: UpdateAdminCustomerStatusPayload,
) {
  return apiRequest<UpdateAdminCustomerStatusResult, UpdateAdminCustomerStatusPayload>({
    method: "PUT",
    url: `/admin/customers/${customerId}/status`,
    data: payload,
  });
}

function normalizeDateTimeParam(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
}
