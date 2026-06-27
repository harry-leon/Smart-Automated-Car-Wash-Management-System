export function customerVehiclesQueryScope(userId?: string | null) {
  return ["customer-vehicles", userId ?? "anonymous"] as const;
}

export function customerVehiclesQueryKey(userId?: string | null, page = 1, limit = 20) {
  return [...customerVehiclesQueryScope(userId), "list", page, limit] as const;
}

export function customerVehicleDetailQueryKey(userId?: string | null, vehicleId?: string | null) {
  return [...customerVehiclesQueryScope(userId), "detail", vehicleId ?? "unknown"] as const;
}
