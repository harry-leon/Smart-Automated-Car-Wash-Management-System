import { apiClient } from "@/lib/api";
import type { ApiPaginatedResponse } from "@/types/api.types";
import type { AdminPromotion, AdminPromotionListPage } from "@/types/promotion.types";

export async function listAdminPromotions(page = 1, limit = 20): Promise<AdminPromotionListPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminPromotion>>("/admin/promotions", {
    params: { page, limit },
  });

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}
