import { apiClient } from "@/lib/api";
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/types/api.types";
import type {
  AdminVoucher,
  AdminVoucherRedemptionPage,
} from "@/types/admin-vouchers.types";

export async function listAdminVouchers(): Promise<AdminVoucher[]> {
  const response = await apiClient.get<ApiSuccessResponse<AdminVoucher[]>>("/admin/vouchers");
  return response.data.data;
}

export async function listAdminVoucherRedemptions(params?: {
  page?: number;
  limit?: number;
  searchQuery?: string;
}): Promise<AdminVoucherRedemptionPage> {
  const response = await apiClient.get<ApiPaginatedResponse<AdminVoucherRedemptionPage["items"][number]>>(
    "/admin/vouchers/redemptions",
    {
      params,
    },
  );

  return {
    items: response.data.data,
    pagination: response.data.pagination,
  };
}
