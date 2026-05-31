export function customerProfileQueryKey(userId?: string | null) {
  return ["customer-profile", userId ?? "anonymous"] as const;
}
