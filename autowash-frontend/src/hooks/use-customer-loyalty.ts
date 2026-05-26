"use client";

import { useQuery } from "@tanstack/react-query";
import {
  customerPromotionsQueryKey,
  loyaltyAccountQueryKey,
  loyaltyTransactionsQueryKey,
  washHistoryQueryKey,
} from "@/hooks/customer-loyalty-query";
import {
  getCustomerLoyaltyAccount,
  listCustomerLoyaltyTransactions,
  listCustomerPromotions,
  listCustomerWashHistory,
} from "@/lib/customer-loyalty-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type {
  CustomerPromotion,
  LoyaltyAccount,
  LoyaltyTransaction,
  WashHistoryItem,
} from "@/types/loyalty.types";

type PaginatedData<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

function useCustomerLoyaltyContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "CUSTOMER");

  return { enabled, userId };
}

export function useCustomerLoyaltyAccount() {
  const { enabled, userId } = useCustomerLoyaltyContext();

  return useQuery<LoyaltyAccount, ApiErrorResponse>({
    queryKey: loyaltyAccountQueryKey(userId),
    queryFn: getCustomerLoyaltyAccount,
    enabled,
  });
}

export function useCustomerLoyaltyTransactions(page = 1, limit = 20) {
  const { enabled, userId } = useCustomerLoyaltyContext();

  return useQuery<PaginatedData<LoyaltyTransaction>, ApiErrorResponse>({
    queryKey: loyaltyTransactionsQueryKey(userId, page, limit),
    queryFn: () => listCustomerLoyaltyTransactions(page, limit),
    enabled,
  });
}

export function useCustomerWashHistory(page = 1, limit = 20) {
  const { enabled, userId } = useCustomerLoyaltyContext();

  return useQuery<PaginatedData<WashHistoryItem>, ApiErrorResponse>({
    queryKey: washHistoryQueryKey(userId, page, limit),
    queryFn: () => listCustomerWashHistory(page, limit),
    enabled,
  });
}

export function useCustomerPromotions() {
  const { enabled, userId } = useCustomerLoyaltyContext();

  return useQuery<CustomerPromotion[], ApiErrorResponse>({
    queryKey: customerPromotionsQueryKey(userId),
    queryFn: listCustomerPromotions,
    enabled,
  });
}
