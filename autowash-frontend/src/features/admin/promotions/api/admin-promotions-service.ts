import { apiClient, apiRequest } from "@/shared/lib/api";
import type { ApiPaginatedResponse } from "@/shared/types/api.types";
import type { Promotion, PromotionListPage, PromotionRequest } from "@/features/admin/promotions/promotion.types";

export async function listAdminPromotions(page = 1, limit = 20): Promise<PromotionListPage> {
  const response = await apiClient.get<ApiPaginatedResponse<Promotion>>("/admin/promotions", {
    params: { page, limit },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getAdminPromotionById(promotionId: string): Promise<Promotion> {
  const response = await apiClient.get<{ data: Promotion; success: boolean }>(`/admin/promotions/${promotionId}`);
  return response.data.data;
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


