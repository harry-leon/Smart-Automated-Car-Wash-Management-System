import { apiClient, apiRequest } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type { Promotion, PromotionListPage, PromotionRequest } from "@/types/promotion.types";

export async function listAdminPromotions(page = 1, limit = 20): Promise<PromotionListPage> {
  const response = await apiClient.get<ApiPaginatedResponse<Promotion>>("/admin/promotions", {
    params: { page, limit },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export function createAdminPromotion(payload: PromotionRequest) {
  return apiRequest<Promotion, PromotionRequest>({
    method: "POST",
    url: "/admin/promotions",
    data: payload,
  });
}

export function updateAdminPromotion(promotionId: string, payload: PromotionRequest) {
  return apiRequest<Promotion, PromotionRequest>({
    method: "PUT",
    url: `/admin/promotions/${promotionId}`,
    data: payload,
  });
}

export function deleteAdminPromotion(promotionId: string) {
  return apiRequest<Promotion>({
    method: "DELETE",
    url: `/admin/promotions/${promotionId}`,
  });
}

