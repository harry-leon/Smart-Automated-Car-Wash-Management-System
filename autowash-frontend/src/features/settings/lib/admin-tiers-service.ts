import { apiClient, apiRequest } from "@/shared/lib/api";
import type { ApiSuccessResponse } from "@/shared/types/api.types";

export type TierConfig = {
  tier: string;
  minPoints: number;
  pointMultiplier: number;
  priorityScore: number;
  updatedAt: string;
};

export type TierConfigRequest = {
  minPoints: number;
  pointMultiplier: number;
  priorityScore: number;
};

export async function getTierConfigs(): Promise<TierConfig[]> {
  return apiRequest<TierConfig[]>({
    url: "/admin/tiers",
    method: "GET",
  });
}

export async function updateTierConfig(
  tier: string,
  request: TierConfigRequest
): Promise<TierConfig> {
  return apiRequest<TierConfig>({
    url: `/admin/tiers/${tier}`,
    method: "PUT",
    data: request,
  });
}
