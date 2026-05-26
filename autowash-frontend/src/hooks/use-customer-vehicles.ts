"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerVehicle,
  deleteCustomerVehicle,
  getCustomerVehicle,
  listCustomerVehicles,
  setPrimaryCustomerVehicle,
  updateCustomerVehicle,
} from "@/lib/vehicle-service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api.types";
import type {
  CreateCustomerVehicleRequest,
  CreateCustomerVehicleResponse,
  CustomerVehicleDetail,
  CustomerVehicleListPage,
  SetPrimaryCustomerVehicleResponse,
  UpdateCustomerVehicleRequest,
  UpdateCustomerVehicleResponse,
} from "@/types/vehicle.types";
import {
  customerVehicleDetailQueryKey,
  customerVehiclesQueryKey,
  customerVehiclesQueryScope,
} from "@/hooks/customer-vehicle-query";

function useVehicleQueryContext() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId ?? null;
  const enabled = Boolean(accessToken && userId && user?.role === "CUSTOMER");

  return { userId, enabled };
}

export function useCustomerVehicles(page = 1, limit = 20) {
  const { userId, enabled } = useVehicleQueryContext();

  return useQuery<CustomerVehicleListPage, ApiErrorResponse>({
    queryKey: customerVehiclesQueryKey(userId, page, limit),
    queryFn: () => listCustomerVehicles({ page, limit }),
    enabled,
  });
}

export function useCustomerVehicleDetail(vehicleId: string) {
  const { userId, enabled } = useVehicleQueryContext();

  return useQuery<CustomerVehicleDetail, ApiErrorResponse>({
    queryKey: customerVehicleDetailQueryKey(userId, vehicleId),
    queryFn: () => getCustomerVehicle(vehicleId),
    enabled: enabled && vehicleId.length > 0,
  });
}

export function useCreateCustomerVehicle() {
  const queryClient = useQueryClient();
  const { userId } = useVehicleQueryContext();

  return useMutation<CreateCustomerVehicleResponse, ApiErrorResponse, CreateCustomerVehicleRequest>(
    {
      mutationFn: createCustomerVehicle,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: customerVehiclesQueryScope(userId) });
      },
    },
  );
}

export function useUpdateCustomerVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  const { userId } = useVehicleQueryContext();

  return useMutation<
    UpdateCustomerVehicleResponse,
    ApiErrorResponse,
    UpdateCustomerVehicleRequest
  >({
    mutationFn: (payload) => updateCustomerVehicle(vehicleId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerVehiclesQueryScope(userId) }),
        queryClient.invalidateQueries({
          queryKey: customerVehicleDetailQueryKey(userId, vehicleId),
        }),
      ]);
    },
  });
}

export function useSetPrimaryCustomerVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  const { userId } = useVehicleQueryContext();

  return useMutation<SetPrimaryCustomerVehicleResponse, ApiErrorResponse, void>({
    mutationFn: () => setPrimaryCustomerVehicle(vehicleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerVehiclesQueryScope(userId) }),
        queryClient.invalidateQueries({
          queryKey: customerVehicleDetailQueryKey(userId, vehicleId),
        }),
      ]);
    },
  });
}

export function useDeleteCustomerVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  const { userId } = useVehicleQueryContext();

  return useMutation<void, ApiErrorResponse, void>({
    mutationFn: () => deleteCustomerVehicle(vehicleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerVehiclesQueryScope(userId) }),
        queryClient.removeQueries({
          queryKey: customerVehicleDetailQueryKey(userId, vehicleId),
        }),
      ]);
    },
  });
}
