"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminPromotion,
  deleteAdminPromotion,
  listAdminPromotions,
  updateAdminPromotion,
} from "@/lib/admin-promotions-service";
import { useAuthStore } from "@/store/auth.store";
import { adminPromotionsQueryKey, adminPromotionsQueryScope } from "@/hooks/admin-promotions-query";
import type { ApiErrorResponse } from "@/types/api.types";
import type { Promotion, PromotionListPage, PromotionRequest } from "@/types/promotion.types";

function useAdminPromotionQueryContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "ADMIN");

  return { userId, enabled };
}

export function useAdminPromotions(page = 1, limit = 20) {
  const { userId, enabled } = useAdminPromotionQueryContext();

  return useQuery<PromotionListPage, ApiErrorResponse>({
    queryKey: adminPromotionsQueryKey(userId, page, limit),
    queryFn: () => listAdminPromotions(page, limit),
    enabled,
  });
}

export function useCreateAdminPromotion() {
  const queryClient = useQueryClient();
  const { userId } = useAdminPromotionQueryContext();

  return useMutation<Promotion, ApiErrorResponse, PromotionRequest>({
    mutationFn: createAdminPromotion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminPromotionsQueryScope(userId) });
    },
  });
}

export function useUpdateAdminPromotion() {
  const queryClient = useQueryClient();
  const { userId } = useAdminPromotionQueryContext();

  return useMutation<
    Promotion,
    ApiErrorResponse,
    { promotionId: string; payload: PromotionRequest }
  >({
    mutationFn: ({ promotionId, payload }) => updateAdminPromotion(promotionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminPromotionsQueryScope(userId) });
    },
  });
}

export function useDeleteAdminPromotion() {
  const queryClient = useQueryClient();
  const { userId } = useAdminPromotionQueryContext();

  return useMutation<Promotion, ApiErrorResponse, string>({
    mutationFn: deleteAdminPromotion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminPromotionsQueryScope(userId) });
    },
  });
}

