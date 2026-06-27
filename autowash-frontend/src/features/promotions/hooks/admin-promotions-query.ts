export function adminPromotionsQueryScope(userId?: string | null) {
  return ["admin-promotions", userId ?? "anonymous"] as const;
}

export function adminPromotionsQueryKey(userId?: string | null, page = 1, limit = 20) {
  return [...adminPromotionsQueryScope(userId), page, limit] as const;
}

