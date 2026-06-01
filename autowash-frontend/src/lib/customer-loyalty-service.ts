import { apiClient, apiRequest } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type {
  CustomerPromotion,
  LoyaltyAccount,
  RedeemPointsRequest,
  RedeemPointsResponse,
  LoyaltyTransaction,
  WashHistoryItem,
} from "@/types/loyalty.types";
import type { Promotion } from "@/types/promotion.types";

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

export function redeemCustomerLoyaltyPoints(payload: RedeemPointsRequest) {
  return apiRequest<RedeemPointsResponse, RedeemPointsRequest>({
    method: "POST",
    url: "/loyalty/redeem",
    data: payload,
  });
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
  return apiClient
    .get<ApiPaginatedResponse<Promotion>>("/promotions", {
      params: { page: 1, limit: 20 },
    })
    .then((response) =>
      response.data.data.map((promotion) => ({
        promotionId: promotion.promotionId,
        name: promotion.name,
        description: promotion.description,
        promotionType: promotion.targetingMode,
        targetTiers: promotion.applicableTiers,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        startDate: promotion.startDate,
        expiresAt: promotion.endDate,
        status: promotion.status,
      })),
    );
}
