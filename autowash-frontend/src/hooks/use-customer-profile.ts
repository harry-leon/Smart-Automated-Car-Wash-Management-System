"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyProfileToAuthUser, isAuthUserInSyncWithProfile } from "@/lib/auth-session";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/profile-service";
import { setAuthUser, useAuthStore } from "@/store/auth.store";
import { customerProfileQueryKey } from "@/hooks/customer-profile-query";
import type { ApiErrorResponse } from "@/types/api.types";
import type {
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UserProfile,
} from "@/types/profile.types";

export function useCustomerProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;

  const query = useQuery<UserProfile, ApiErrorResponse>({
    queryKey: customerProfileQueryKey(userId),
    queryFn: getCustomerProfile,
    enabled: Boolean(accessToken && userId && user?.role === "CUSTOMER"),
  });

  useEffect(() => {
    if (!query.data || !user) {
      return;
    }

    if (isAuthUserInSyncWithProfile(user, query.data)) {
      return;
    }

    setAuthUser(applyProfileToAuthUser(user, query.data));
  }, [query.data, user]);

  return query;
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;

  return useMutation<
    UpdateUserProfileResponse,
    ApiErrorResponse,
    UpdateUserProfileRequest
  >({
    mutationFn: updateCustomerProfile,
    onSuccess: (response) => {
      queryClient.setQueryData<UserProfile | undefined>(
        customerProfileQueryKey(userId),
        (current) =>
          current
            ? {
                ...current,
                fullName: response.fullName,
                phone: response.phone,
                email: response.email,
              }
            : undefined,
      );

      if (user) {
        setAuthUser({
          ...user,
          fullName: response.fullName,
          phone: response.phone,
          email: response.email,
        });
      }

      void queryClient.invalidateQueries({ queryKey: customerProfileQueryKey(userId) });
    },
  });
}
