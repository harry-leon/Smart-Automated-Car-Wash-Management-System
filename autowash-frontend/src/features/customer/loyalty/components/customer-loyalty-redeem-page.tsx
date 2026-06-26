"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { useCustomerLoyaltyAccount, useCustomerRedeemPoints } from "@/features/customer/loyalty/hooks/use-customer-loyalty";
import type { RedeemPointsResponse } from "@/features/customer/loyalty/loyalty.types";
import { useLanguageStore, translate } from "@/shared/store/language.store";

const MIN_REDEEM_POINTS = 50;
const MAX_REDEEM_POINTS = 200;
const VND_PER_POINT = 1_000;

export function CustomerLoyaltyRedeemPageContent() {
  const { language } = useLanguageStore();
  const accountQuery = useCustomerLoyaltyAccount();
  const redeemMutation = useCustomerRedeemPoints();
  const [pointsInput, setPointsInput] = useState("50");
  const [referenceId, setReferenceId] = useState("");
  const [successVoucher, setSuccessVoucher] = useState<RedeemPointsResponse | null>(null);
  const locale = language === "vi" ? "vi-VN" : "en-US";

  const points = useMemo(() => Number.parseInt(pointsInput, 10), [pointsInput]);
  const validationMessage = getValidationMessage(pointsInput, points, accountQuery.data?.availablePoints ?? null, language);
  const estimatedVnd = Number.isFinite(points) ? Math.max(points, 0) * VND_PER_POINT : 0;
  const remainingBalance =
    accountQuery.data && Number.isFinite(points) ? accountQuery.data.availablePoints - Math.max(points, 0) : null;

  const submitDisabled =
    accountQuery.isPending || accountQuery.isError || redeemMutation.isPending || Boolean(validationMessage);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessVoucher(null);
    if (!accountQuery.data || validationMessage) {
      return;
    }

    redeemMutation.mutate(
      {
        pointsToRedeem: points,
        referenceId: referenceId.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          setSuccessVoucher(response);
          setReferenceId("");
        },
      },
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>{translate("Đổi điểm tích lũy", "Redeem loyalty points", language)}</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={() => accountQuery.refetch()} disabled={accountQuery.isFetching}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {translate("Tải lại số dư", "Refresh balance", language)}
            </Button>
          </CardHeader>
        </Card>

        {accountQuery.isPending ? <div className="h-64 animate-pulse rounded-2xl bg-slate-100" /> : null}
        {accountQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>{translate("Không thể tải số dư tích điểm", "Unable to load loyalty balance", language)}</CardTitle>
              <CardDescription>{getDisplayErrorMessage(accountQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {accountQuery.data ? (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>{translate("Biểu mẫu đổi điểm", "Redeem form", language)}</CardTitle>
                <CardDescription>{translate("Gửi yêu cầu đổi điểm từ ví tích lũy hiện tại của bạn.", "Submit redemption against your current loyalty wallet balance.", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="redeem-points">{translate("Số điểm muốn đổi", "Points to redeem", language)}</Label>
                  <Input
                    id="redeem-points"
                    type="number"
                    min={MIN_REDEEM_POINTS}
                    max={MAX_REDEEM_POINTS}
                    step={1}
                    value={pointsInput}
                    onChange={(event) => setPointsInput(event.target.value)}
                    placeholder="50"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 150, 200].map((value) => (
                      <Button key={value} type="button" variant="outline" onClick={() => setPointsInput(String(value))}>
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redeem-reference">{translate("Tham chiếu (tuỳ chọn)", "Reference (optional)", language)}</Label>
                  <Input
                    id="redeem-reference"
                    type="text"
                    value={referenceId}
                    onChange={(event) => setReferenceId(event.target.value)}
                    placeholder={translate("Mã đặt lịch hoặc ghi chú", "Booking code or note", language)}
                  />
                </div>

                {validationMessage ? (
                  <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {validationMessage}
                  </p>
                ) : null}
                {redeemMutation.isError ? (
                  <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {getDisplayErrorMessage(redeemMutation.error)}
                  </p>
                ) : null}
                {successVoucher ? (
                  <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      {translate("Đổi điểm thành công", "Redemption successful", language)}
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <SummaryRow label={translate("Mã voucher", "Voucher code", language)} value={successVoucher.voucherCode} />
                      <SummaryRow label={translate("Điểm đã đổi", "Points redeemed", language)} value={`${successVoucher.pointsRedeemed.toLocaleString(locale)} ${translate("điểm", "points", language)}`} />
                      <SummaryRow label={translate("Giá trị voucher", "Voucher value", language)} value={`${successVoucher.voucherValue.toLocaleString(locale)} VND`} />
                      <SummaryRow label={translate("Hết hạn", "Expires", language)} value={new Date(successVoucher.expiresAt).toLocaleDateString(locale)} />
                      <SummaryRow label={translate("Trạng thái", "Status", language)} value={successVoucher.status} />
                      <SummaryRow label={translate("Số dư mới", "New available balance", language)} value={`${successVoucher.newBalance.toLocaleString(locale)} ${translate("điểm", "points", language)}`} />
                    </div>
                  </div>
                ) : null}

                <Button type="submit" disabled={submitDisabled} className="w-full sm:w-auto">
                  {redeemMutation.isPending ? translate("Đang đổi điểm...", "Redeeming...", language) : translate("Đổi điểm", "Redeem points", language)}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>{translate("Tóm tắt đổi điểm", "Redemption summary", language)}</CardTitle>
                <CardDescription>{translate("Tính toán trực tiếp từ dữ liệu hiện tại.", "Live calculation from current input.", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <SummaryRow label={translate("Điểm khả dụng", "Available points", language)} value={`${accountQuery.data.availablePoints.toLocaleString(locale)} ${translate("điểm", "points", language)}`} />
                <SummaryRow label={translate("Điểm tích lũy", "Lifetime points", language)} value={`${accountQuery.data.lifetimePoints.toLocaleString(locale)} ${translate("điểm", "points", language)}`} />
                <SummaryRow label={translate("Số điểm đổi", "Redeem amount", language)} value={`${Number.isFinite(points) ? Math.max(points, 0).toLocaleString(locale) : 0} ${translate("điểm", "points", language)}`} />
                <SummaryRow label={translate("Giá trị voucher", "Voucher value", language)} value={`${estimatedVnd.toLocaleString(locale)} VND`} />
                <SummaryRow
                  label={translate("Số dư còn lại", "Remaining balance", language)}
                  value={
                    remainingBalance == null
                      ? "N/A"
                      : `${Math.max(remainingBalance, 0).toLocaleString(locale)} ${translate("điểm", "points", language)}`
                  }
                />

                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link href="/customer/loyalty/history">
                    {translate("Xem lịch sử giao dịch", "View transaction history", language)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function getValidationMessage(pointsInput: string, points: number, currentBalance: number | null, language: "vi" | "en") {
  if (!pointsInput.trim()) {
    return translate("Vui lòng nhập số điểm muốn đổi.", "Please enter points to redeem.", language);
  }
  if (!Number.isFinite(points)) {
    return translate("Số điểm phải là số hợp lệ.", "Points must be a valid number.", language);
  }
  if (!Number.isInteger(points)) {
    return translate("Chỉ có thể đổi số điểm nguyên.", "Only whole points can be redeemed.", language);
  }
  if (points < MIN_REDEEM_POINTS) {
    return translate(`Tối thiểu ${MIN_REDEEM_POINTS} điểm.`, `Minimum redemption is ${MIN_REDEEM_POINTS} points.`, language);
  }
  if (points > MAX_REDEEM_POINTS) {
    return translate(`Tối đa ${MAX_REDEEM_POINTS} điểm.`, `Maximum redemption is ${MAX_REDEEM_POINTS} points.`, language);
  }
  if (currentBalance != null && points > currentBalance) {
    return translate("Không đủ điểm để đổi.", "Insufficient points for this redemption.", language);
  }
  return null;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
