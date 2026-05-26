import { apiClient, apiRequest } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type {
  CustomerPromotion,
  LoyaltyAccount,
  LoyaltyTransaction,
  WashHistoryItem,
} from "@/types/loyalty.types";

export function getCustomerLoyaltyAccount() {
  return apiRequest<LoyaltyAccount>({
    method: "GET",
    url: "/loyalty/account",
  });
}

export async function listCustomerLoyaltyTransactions(page = 1, limit = 20) {
  const response = await apiClient.get<ApiPaginatedResponse<LoyaltyTransaction>>("/loyalty/transactions", {
    params: { page, limit },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function listCustomerWashHistory(page = 1, limit = 20) {
  const response = await apiClient.get<ApiPaginatedResponse<WashHistoryItem>>("/customers/wash-history", {
    params: { page, limit },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export function listCustomerPromotions() {
  return apiRequest<CustomerPromotion[]>({
    method: "GET",
    url: "/promotions/active",
  });
}
