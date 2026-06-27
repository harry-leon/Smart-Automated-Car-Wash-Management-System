"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { Badge } from "@/shared/ui/ui/badge";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { formatPromotionType, formatTierLabel } from "@/features/loyalty/lib/customer-loyalty";
import { useCustomerPromotions } from "@/features/loyalty/hooks/use-customer-loyalty";
import { useLanguageStore, translate } from "@/shared/store/language.store";

export function CustomerPromotionsPageContent() {
  const { language } = useLanguageStore();
  const promotionsQuery = useCustomerPromotions();
  const locale = language === "vi" ? "vi-VN" : "en-US";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>{translate(language, "Khuyến mãi hiện có", "Available promotions")}</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={() => promotionsQuery.refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {translate(language, "Tải lại", "Refresh")}
            </Button>
          </CardHeader>
        </Card>

        {promotionsQuery.isPending ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : promotionsQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>{translate(language, "Không thể tải khuyến mãi", "Unable to load promotions")}</CardTitle>
              <CardDescription>{getDisplayErrorMessage(promotionsQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : !promotionsQuery.data || promotionsQuery.data.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{translate(language, "Không có khuyến mãi nào", "No promotions available")}</CardTitle>
              <CardDescription>
                {translate(
                  language,
                  "Hiện không có khuyến mãi nào phù hợp với hạng thành viên của bạn.",
                  "There are no active promotions matching your current tier right now.",
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {promotionsQuery.data.map((promotion) => (
              <Card key={promotion.promotionId} className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">{promotion.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {promotion.description ?? translate(language, "Chương trình khuyến mãi", "Promotion campaign")}
                      </div>
                    </div>
                    <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">
                      {formatPromotionType(promotion.promotionType)}
                    </Badge>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {translate(language, "Giảm giá", "Discount")}
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">
                      {promotion.discountType === "PERCENT"
                        ? `${promotion.discountValue}%`
                        : `${promotion.discountValue.toLocaleString(locale)} VND`}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {translate(language, "Hạng đủ điều kiện", "Eligible tiers")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {promotion.targetTiers.map((tier) => (
                        <Badge key={tier} variant="outline">
                          {formatTierLabel(tier)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-slate-500">
                    {translate(language, "Từ", "Active from")} {new Date(promotion.startDate).toLocaleDateString(locale)} · {translate(language, "Hết hạn", "Expires")} {new Date(promotion.expiresAt).toLocaleDateString(locale)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
