"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  getSystemSettings,
  updateSystemSettings,
  type SystemSettings,
} from "@/features/admin/settings/lib/admin-settings-service";
import type { ApiErrorResponse } from "@/shared/types/api.types";

function useAdminSettingsContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "ADMIN");
  return { userId, enabled };
}

function settingsScope(userId: string | null) {
  return ["admin-settings", userId] as const;
}

export function useSystemSettings() {
  const { userId, enabled } = useAdminSettingsContext();
  return useQuery<SystemSettings, ApiErrorResponse>({
    queryKey: [...settingsScope(userId)],
    queryFn: getSystemSettings,
    enabled,
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  const { userId } = useAdminSettingsContext();

  return useMutation<SystemSettings, ApiErrorResponse, Omit<SystemSettings, "updatedAt">>({
    mutationFn: updateSystemSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsScope(userId) });
    },
  });
}
