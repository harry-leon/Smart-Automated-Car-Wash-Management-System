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

const MIN_REDEEM_POINTS = 50;
const MAX_REDEEM_POINTS = 200;
const VND_PER_POINT = 1_000;

export function CustomerLoyaltyRedeemPageContent() {
  const accountQuery = useCustomerLoyaltyAccount();
  const redeemMutation = useCustomerRedeemPoints();
  const [pointsInput, setPointsInput] = useState("50");
  const [referenceId, setReferenceId] = useState("");
  const [successVoucher, setSuccessVoucher] = useState<RedeemPointsResponse | null>(null);

  const points = useMemo(() => Number.parseInt(pointsInput, 10), [pointsInput]);
  const validationMessage = getValidationMessage(pointsInput, points, accountQuery.data?.availablePoints ?? null);
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
              <CardTitle>Redeem loyalty points</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={() => accountQuery.refetch()} disabled={accountQuery.isFetching}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh balance
            </Button>
          </CardHeader>
        </Card>

        {accountQuery.isPending ? <div className="h-64 animate-pulse rounded-2xl bg-slate-100" /> : null}
        {accountQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>Unable to load loyalty balance</CardTitle>
              <CardDescription>{getDisplayErrorMessage(accountQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {accountQuery.data ? (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Redeem form</CardTitle>
                <CardDescription>Submit redemption against your current loyalty wallet balance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="redeem-points">Points to redeem</Label>
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
                  <Label htmlFor="redeem-reference">Reference (optional)</Label>
                  <Input
                    id="redeem-reference"
                    type="text"
                    value={referenceId}
                    onChange={(event) => setReferenceId(event.target.value)}
                    placeholder="Booking code or note"
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
                      Redemption successful
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <SummaryRow label="Voucher code" value={successVoucher.voucherCode} />
                      <SummaryRow label="Points redeemed" value={`${successVoucher.pointsRedeemed.toLocaleString("vi-VN")} points`} />
                      <SummaryRow label="Voucher value" value={`${successVoucher.voucherValue.toLocaleString("vi-VN")} VND`} />
                      <SummaryRow label="Expires" value={new Date(successVoucher.expiresAt).toLocaleDateString("vi-VN")} />
                      <SummaryRow label="Status" value={successVoucher.status} />
                      <SummaryRow label="New available balance" value={`${successVoucher.newBalance.toLocaleString("vi-VN")} points`} />
                    </div>
                  </div>
                ) : null}

                <Button type="submit" disabled={submitDisabled} className="w-full sm:w-auto">
                  {redeemMutation.isPending ? "Redeeming..." : "Redeem points"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Redemption summary</CardTitle>
                <CardDescription>Live calculation from current input.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <SummaryRow label="Available points" value={`${accountQuery.data.availablePoints.toLocaleString("vi-VN")} points`} />
                <SummaryRow label="Lifetime points" value={`${accountQuery.data.lifetimePoints.toLocaleString("vi-VN")} points`} />
                <SummaryRow label="Redeem amount" value={`${Number.isFinite(points) ? Math.max(points, 0).toLocaleString("vi-VN") : 0} points`} />
                <SummaryRow label="Voucher value" value={`${estimatedVnd.toLocaleString("vi-VN")} VND`} />
                <SummaryRow
                  label="Remaining balance"
                  value={
                    remainingBalance == null
                      ? "N/A"
                      : `${Math.max(remainingBalance, 0).toLocaleString("vi-VN")} points`
                  }
                />

                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link href="/customer/loyalty/history">
                    View transaction history
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

function getValidationMessage(pointsInput: string, points: number, currentBalance: number | null) {
  if (!pointsInput.trim()) {
    return "Please enter points to redeem.";
  }
  if (!Number.isFinite(points)) {
    return "Points must be a valid number.";
  }
  if (!Number.isInteger(points)) {
    return "Only whole points can be redeemed.";
  }
  if (points < MIN_REDEEM_POINTS) {
    return `Minimum redemption is ${MIN_REDEEM_POINTS} points.`;
  }
  if (points > MAX_REDEEM_POINTS) {
    return `Maximum redemption is ${MAX_REDEEM_POINTS} points.`;
  }
  if (currentBalance != null && points > currentBalance) {
    return "Insufficient points for this redemption.";
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
