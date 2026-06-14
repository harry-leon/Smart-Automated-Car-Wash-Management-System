"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminVoucherRedemptions, listAdminVouchers } from "@/features/admin/vouchers/api/admin-vouchers-service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type { AdminVoucher, AdminVoucherRedemptionPage } from "@/features/admin/vouchers/admin-vouchers.types";

function useAdminVoucherQueryContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "ADMIN");

  return { userId, enabled };
}

export function useAdminVouchers() {
  const { userId, enabled } = useAdminVoucherQueryContext();

  return useQuery<AdminVoucher[], ApiErrorResponse>({
    queryKey: ["admin-vouchers", userId, "catalog"],
    queryFn: listAdminVouchers,
    enabled,
  });
}

export function useAdminVoucherRedemptions(page = 1, limit = 20, searchQuery?: string) {
  const { userId, enabled } = useAdminVoucherQueryContext();

  return useQuery<AdminVoucherRedemptionPage, ApiErrorResponse>({
    queryKey: ["admin-vouchers", userId, "redemptions", page, limit, searchQuery ?? ""],
    queryFn: () => listAdminVoucherRedemptions({ page, limit, searchQuery }),
    enabled,
  });
}
