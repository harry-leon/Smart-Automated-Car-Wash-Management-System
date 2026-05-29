"use client";

import { RefreshCcw } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { formatTierLabel } from "@/lib/customer-loyalty";
import { useAdminPromotions } from "@/hooks/use-admin-promotions";
import { useAuthStore } from "@/store/auth.store";
import type { AdminPromotionStatus } from "@/types/promotion.types";

const STATUS_BADGE: Record<AdminPromotionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  ACTIVE: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  PAUSED: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  EXPIRED: "bg-rose-50 text-rose-700 hover:bg-rose-50",
};

export default function AdminPromotionsPage() {
  const user = useAuthStore((state) => state.user);
  const promotionsQuery = useAdminPromotions(1, 100);
  const activeCount = useMemo(
    () => promotionsQuery.data?.items.filter((item) => item.status === "ACTIVE").length ?? 0,
    [promotionsQuery.data?.items],
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Promotion management</CardTitle>
              <CardDescription>
                Live data from `GET /api/v1/admin/promotions`. Only admin-authenticated users can
                see this page.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => promotionsQuery.refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                Signed in as {user?.fullName ?? "Admin"}
              </div>
            </div>
          </CardHeader>
        </Card>

        {promotionsQuery.isPending ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-60 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : promotionsQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>Unable to load promotions</CardTitle>
              <CardDescription>{getDisplayErrorMessage(promotionsQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : !promotionsQuery.data || promotionsQuery.data.items.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>No promotions available</CardTitle>
              <CardDescription>
                The admin promotion endpoint returned an empty result set.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Total promotions" value={promotionsQuery.data.items.length} />
              <MetricCard label="Active promotions" value={activeCount} />
              <MetricCard label="Inactive promotions" value={promotionsQuery.data.items.length - activeCount} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {promotionsQuery.data.items.map((promotion) => (
                <Card key={promotion.promotionId} className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-slate-900">{promotion.name}</div>
                        <div className="mt-1 text-sm text-slate-600">{promotion.promotionId}</div>
                      </div>
                      <Badge className={STATUS_BADGE[promotion.status]}>{promotion.status}</Badge>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">{promotion.description}</p>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Discount</div>
                      <div className="mt-2 text-2xl font-black text-slate-900">
                        {promotion.discountType === "PERCENT"
                          ? `${promotion.discountValue}%`
                          : `${promotion.discountValue.toLocaleString("vi-VN")} VND`}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Targeting {formatTargetingMode(promotion.targetingMode)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        Eligible tiers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {promotion.applicableTiers.length > 0 ? (
                          promotion.applicableTiers.map((tier) => (
                            <Badge key={tier} variant="outline">
                              {formatTierLabel(tier)}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">All tiers</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-500">
                      <div>Start: {new Date(promotion.startDate).toLocaleString("vi-VN")}</div>
                      <div>End: {new Date(promotion.endDate).toLocaleString("vi-VN")}</div>
                      <div>
                        Max uses/customer:{" "}
                        {promotion.maxUsagePerCustomer ?? "Unlimited"}
                      </div>
                      <div>Updated: {new Date(promotion.updatedAt).toLocaleString("vi-VN")}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardContent className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</div>
        <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function formatTargetingMode(value: string) {
  switch (value) {
    case "ALL_MEMBERS":
      return "All members";
    case "SELECTED_TIERS":
      return "Selected tiers";
    case "NEW_CUSTOMERS":
      return "New customers";
    default:
      return value;
  }
}
