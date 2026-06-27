"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  getCustomerPreferences,
  updateCustomerPreferences,
} from "@/features/preferences/lib/preferences-service";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import type {
  CustomerPreferences,
  UpdateCustomerPreferencesRequest,
  UpdateCustomerPreferencesResponse,
} from "@/entities/preferences";

function useCustomerPreferencesContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;

  return {
    userId,
    enabled: Boolean(accessToken && userId),
  };
}

function preferencesQueryKey(userId: string | null) {
  return ["customer-preferences", userId] as const;
}

export function useCustomerPreferences() {
  const { userId, enabled } = useCustomerPreferencesContext();

  return useQuery<CustomerPreferences, ApiErrorResponse>({
    queryKey: preferencesQueryKey(userId),
    queryFn: getCustomerPreferences,
    enabled,
  });
}

export function useUpdateCustomerPreferences() {
  const queryClient = useQueryClient();
  const { userId } = useCustomerPreferencesContext();

  return useMutation<
    UpdateCustomerPreferencesResponse,
    ApiErrorResponse,
    UpdateCustomerPreferencesRequest
  >({
    mutationFn: updateCustomerPreferences,
    onSuccess: async (_response, variables) => {
      queryClient.setQueryData<CustomerPreferences | undefined>(
        preferencesQueryKey(userId),
        () => variables,
      );
      await queryClient.invalidateQueries({ queryKey: preferencesQueryKey(userId) });
    },
  });
}
