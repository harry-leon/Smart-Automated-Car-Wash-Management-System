"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminPromotions } from "@/lib/admin-promotion-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AdminPromotionListPage } from "@/types/promotion.types";

export function useAdminPromotions(page = 1, limit = 20) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(accessToken && user?.role === "ADMIN");

  return useQuery<AdminPromotionListPage, ApiErrorResponse>({
    queryKey: ["admin-promotions", page, limit],
    queryFn: () => listAdminPromotions(page, limit),
    enabled,
  });
}
