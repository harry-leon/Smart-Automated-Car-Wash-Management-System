"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import {
  CheckCircle2,
  Crown,
  Gift,
  Loader2,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Wallet,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  buildLoyaltySummary,
  formatLoyaltyPoints,
  formatLoyaltyTransactionType,
  formatTierLabel,
} from "@/features/customer/loyalty/lib/customer-loyalty";
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
  useCustomerRedeemPoints,
} from "@/features/customer/loyalty/hooks/use-customer-loyalty";
import { cn } from "@/shared/lib/utils";
import type { RedeemPointsResponse, TierVoucherOffer } from "@/features/customer/loyalty/loyalty.types";

type VoucherOfferState = TierVoucherOffer & {
  eligible: boolean;
  affordable: boolean;
};

const TIER_ORDER = ["MEMBER", "SILVER", "GOLD", "PLATINUM"] as const;

const REDEEM_RULES = [
  { tier: "MEMBER", value: "50 pts → 50,000 VND" },
  { tier: "SILVER", value: "100 pts → 100,000 VND" },
  { tier: "GOLD", value: "150 pts → 150,000 VND" },
  { tier: "PLATINUM", value: "200 pts → 200,000 VND" },
] as const;

const MIN_REDEEM_POINTS = 50;
const MAX_REDEEM_POINTS = 200;
const VND_PER_POINT = 1_000;

export function CustomerLoyaltyPageContent() {
  const accountQuery = useCustomerLoyaltyAccount();
  const transactionsQuery = useCustomerLoyaltyTransactions(1, 5);
  const redeemMutation = useCustomerRedeemPoints();
  const [selectedOffer, setSelectedOffer] = useState<VoucherOfferState | null>(null);
  const [successVoucher, setSuccessVoucher] = useState<RedeemPointsResponse | null>(null);
  const [redeemPointsInput, setRedeemPointsInput] = useState("50");
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const summary = useMemo(
    () => (accountQuery.data ? buildLoyaltySummary(accountQuery.data) : null),
    [accountQuery.data],
  );

  const redeemPoints = useMemo(() => Number.parseInt(redeemPointsInput, 10), [redeemPointsInput]);
  const redemptionValidation = getRedemptionValidationMessage(
    redeemPointsInput,
    redeemPoints,
    summary?.availablePoints ?? null,
  );
  const previewVoucherValue = Number.isFinite(redeemPoints) ? Math.max(redeemPoints, 0) * VND_PER_POINT : 0;
  const previewRemainingBalance =
    summary && Number.isFinite(redeemPoints) ? Math.max(summary.availablePoints - Math.max(redeemPoints, 0), 0) : 0;
  const previewExpiresAt = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }, []);

  const handleRedeem = () => {
    if (!selectedOffer || !summary) {
      return;
    }

    setSuccessVoucher(null);
    redeemMutation.mutate(
      {
        pointsToRedeem: selectedOffer.pointsCost,
        referenceId: `loyalty-voucher:${selectedOffer.id}`,
      },
      {
        onSuccess: (response) => {
          setSuccessVoucher(response);
          setSelectedOffer(null);
        },
      },
    );
  };

  const handleCustomRedeem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessVoucher(null);
    if (!summary || redemptionValidation) {
      return;
    }

    redeemMutation.mutate(
      {
        pointsToRedeem: redeemPoints,
        referenceId: `loyalty-voucher:${redeemPoints}`,
      },
      {
        onSuccess: setSuccessVoucher,
      },
    );
  };

  if (accountQuery.isPending) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto h-96 max-w-7xl animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (accountQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl rounded-lg border-rose-200 bg-white">
          <CardHeader>
            <CardTitle>Unable to load loyalty account</CardTitle>
            <CardDescription>{getDisplayErrorMessage(accountQuery.error)}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const currentTierIndex = TIER_ORDER.indexOf(summary.tier);
  const selectedRemainingPoints = selectedOffer
    ? Math.max(summary.availablePoints - selectedOffer.pointsCost, 0)
    : summary.availablePoints;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="grid gap-5">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("w-fit border px-3 py-1 text-sm", tierBadgeClass(summary.tier))} variant="outline">
                    {summary.tierLabel}
                  </Badge>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Current tier
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Loyalty wallet
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Redeem points for tier-based vouchers. Higher tiers unlock better rewards.
                  </p>
                </div>
              </div>
              <div className={cn("flex h-16 w-16 items-center justify-center rounded-3xl shadow-sm", tierIconClass(summary.tier))}>
                <Crown className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <MetricTile icon={Wallet} label="Available points" value={`${summary.availablePoints.toLocaleString("en-US")} pts`} />
              <MetricTile icon={Sparkles} label="Lifetime points" value={`${summary.lifetimePoints.toLocaleString("en-US")} pts`} />
              <MetricTile icon={ShieldCheck} label="Completed washes" value={String(summary.completedWashCount)} />
            </div>

            <div className="mt-7 rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Lifetime tier progress</div>
                  <div className="mt-2 text-lg font-black text-slate-950">{summary.progress.progressPercent}% complete</div>
                  {summary.progress.nextTier ? (
                    <div className="mt-1 text-sm text-slate-600">
                      {`${summary.lifetimePoints.toLocaleString("en-US")} / ${(summary.lifetimePoints + summary.progress.pointsToNextTier).toLocaleString("en-US")} lifetime pts`}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-slate-600">At the highest tier</div>
                  )}
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
                  {summary.progress.nextTier ? `${formatTierLabel(summary.progress.nextTier)} next` : "Max tier"}
                </div>
              </div>

              <div className="mt-4 relative h-10 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-300", tierProgressClass(summary.tier))}
                  style={{ width: `${summary.progress.progressPercent}%` }}
                />
                <div className="relative flex h-full items-center justify-center text-sm font-semibold text-slate-950">
                      {summary.progress.nextTier ? (
                    <span>
                      {summary.lifetimePoints.toLocaleString("en-US")} / {(summary.lifetimePoints + summary.progress.pointsToNextTier).toLocaleString("en-US")} lifetime pts
                    </span>
                  ) : (
                    <span>At the highest tier</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {successVoucher ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Redemption successful
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight">{successVoucher.voucherCode}</div>
                <p className="mt-1 text-sm text-emerald-800">
                  Your voucher is ready to use on a future booking.
                </p>
              </div>
              <Badge className="w-fit border-emerald-200 bg-white text-emerald-700" variant="outline">
                {successVoucher.status}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SuccessVoucherMetric label="Points redeemed" value={`${successVoucher.pointsRedeemed.toLocaleString("en-US")} pts`} />
              <SuccessVoucherMetric label="Voucher value" value={`${successVoucher.voucherValue.toLocaleString("en-US")} VND`} />
              <SuccessVoucherMetric label="Expires" value={new Date(successVoucher.expiresAt).toLocaleDateString("en-US")} />
            </div>
          </div>
        ) : null}

        {redeemMutation.isError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {getDisplayErrorMessage(redeemMutation.error)}
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleCustomRedeem} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">Redeem points</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose available points to convert into a fixed-value voucher.
                </p>
              </div>
              <Badge variant="outline" className="w-fit border-slate-200 bg-slate-50 text-slate-700">
                {summary.availablePoints.toLocaleString("en-US")} pts available
              </Badge>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loyalty-redeem-points">Points to redeem</Label>
                <Input
                  id="loyalty-redeem-points"
                  type="number"
                  min={MIN_REDEEM_POINTS}
                  max={MAX_REDEEM_POINTS}
                  step={1}
                  value={redeemPointsInput}
                  onChange={(event) => setRedeemPointsInput(event.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 150, 200].map((value) => (
                  <Button key={value} type="button" variant="outline" onClick={() => setRedeemPointsInput(String(value))}>
                    {value}
                  </Button>
                ))}
              </div>

              {redemptionValidation ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                  {redemptionValidation}
                </div>
              ) : null}

              <Button type="submit" disabled={redeemMutation.isPending || Boolean(redemptionValidation)}>
                {redeemMutation.isPending ? <Loader2 className="animate-spin" /> : <Gift />}
                Confirm redemption
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-950">Voucher preview</h3>
                <p className="mt-1 text-sm text-slate-600">Preview updates before confirmation.</p>
              </div>
              <TicketPercent className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <RuleRow label="Points selected" value={`${Number.isFinite(redeemPoints) ? Math.max(redeemPoints, 0).toLocaleString("en-US") : 0} pts`} />
              <RuleRow label="Voucher value" value={`${previewVoucherValue.toLocaleString("en-US")} VND`} />
              <RuleRow label="Balance after redemption" value={`${previewRemainingBalance.toLocaleString("en-US")} pts`} />
              <RuleRow label="Estimated expiry" value={previewExpiresAt.toLocaleDateString("en-US")} />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">Voucher exchange</h2>
                <p className="text-sm text-slate-600">Choose a voucher available for your current membership tier.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summary.voucherOffers.map((offer) => {
                const disabled = !offer.eligible || !offer.affordable || redeemMutation.isPending;
                return (
                  <div
                    key={offer.id}
                    className={cn(
                      "flex min-h-[230px] flex-col rounded-lg border bg-white p-5 shadow-sm transition",
                      offer.eligible ? offerBorderClass(offer.accent) : "border-slate-200 opacity-70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", offerIconClass(offer.accent))}>
                        <TicketPercent className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={cn("border px-2 py-1", offerBadgeClass(offer.accent))}>
                        {offer.badge}
                      </Badge>
                    </div>

                    <div className="mt-4 flex-1">
                      <h3 className="text-base font-black text-slate-950">{offer.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {offer.voucherValue.toLocaleString("en-US")} VND voucher for {formatTierLabel(offer.minTier)} members and above.
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase text-slate-500">Cost</div>
                        <div className="text-lg font-black text-slate-950">{offer.pointsCost} pts</div>
                      </div>
                      <Button
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedOffer(offer)}
                        title={!offer.eligible ? "Your current tier is not eligible yet" : !offer.affordable ? "Not enough points" : undefined}
                      >
                        {!offer.eligible ? "Locked" : !offer.affordable ? "Not enough" : "Redeem"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-950">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">i</span>
                <span>Redeem rules</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Voucher value uses a fixed conversion of 1 point to 1,000 VND.</p>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                {REDEEM_RULES.map((rule) => (
                  <div key={rule.tier} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <span className={cn(
                      "inline-flex h-8 min-w-[3rem] items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-[0.14em]",
                      tierRuleBadgeClass(rule.tier),
                    )}>
                      {rule.tier}
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Redeem value</div>
                      <div className="mt-1 text-sm font-black text-slate-950">{rule.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 text-sm italic text-slate-600">
                Available points can be redeemed for rewards unlocked by your current tier.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Recent point activity</CardTitle>
                  <CardDescription>Latest earned-point entries after wash completion.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {transactionsQuery.isPending ? (
                <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
              ) : transactionsQuery.isError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(transactionsQuery.error)}
                </div>
              ) : !transactionsQuery.data || transactionsQuery.data.items.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No point transactions yet.
                </div>
              ) : (
                <>
                  {(showAllTransactions ? transactionsQuery.data.items : transactionsQuery.data.items.slice(0, 3)).map((item) => (
                    <div key={item.transactionId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-slate-900">{formatLoyaltyTransactionType(item.type)}</div>
                        <div className={item.points >= 0 ? "text-sm font-black text-emerald-700" : "text-sm font-black text-rose-700"}>
                          {formatLoyaltyPoints(item.points)}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                      <div className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("en-US")}</div>
                    </div>
                  ))}
                  {transactionsQuery.data.items.length > 3 ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 text-sm text-slate-500">
                        Showing {showAllTransactions ? transactionsQuery.data.items.length : 3} of {transactionsQuery.data.items.length} history entries
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button
                          type="button"
                          variant={showAllTransactions ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => setShowAllTransactions(true)}
                          disabled={showAllTransactions}
                        >
                          Show all
                        </Button>
                        <Button
                          type="button"
                          variant={showAllTransactions ? "outline" : "ghost"}
                          size="sm"
                          onClick={() => setShowAllTransactions(false)}
                          disabled={!showAllTransactions}
                        >
                          Show less
                        </Button>
                        <Link
                          href="/customer/loyalty/history"
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View full history
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={Boolean(selectedOffer)} onOpenChange={(open: boolean) => !open && setSelectedOffer(null)}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm voucher redemption?</DialogTitle>
            <DialogDescription>
              {selectedOffer
                ? `You will spend ${selectedOffer.pointsCost.toLocaleString("en-US")} points to redeem ${selectedOffer.title}, worth ${selectedOffer.voucherValue.toLocaleString("en-US")} VND.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer ? (
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <RuleRow label="Available points" value={`${summary.availablePoints.toLocaleString("en-US")} pts`} />
              <RuleRow label="Points used" value={`${selectedOffer.pointsCost.toLocaleString("en-US")} pts`} />
              <RuleRow label="Balance after redemption" value={`${selectedRemainingPoints.toLocaleString("en-US")} pts`} />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedOffer(null)} disabled={redeemMutation.isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRedeem} disabled={redeemMutation.isPending}>
              {redeemMutation.isPending ? <Loader2 className="animate-spin" /> : <Gift />}
              Confirm redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
          <div className="text-lg font-black text-slate-950">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SuccessVoucherMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
      <div className="text-xs font-semibold uppercase text-emerald-700">{label}</div>
      <div className="mt-1 text-sm font-black text-slate-950">{value}</div>
    </div>
  );
}

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function getRedemptionValidationMessage(pointsInput: string, points: number, availablePoints: number | null) {
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
  if (availablePoints != null && points > availablePoints) {
    return "Insufficient available points for this redemption.";
  }
  return null;
}

function tierBadgeClass(tier: string) {
  if (tier === "PLATINUM") return "border-rose-200 bg-rose-50 text-rose-700";
  if (tier === "GOLD") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tier === "SILVER") return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function tierIconClass(tier: string) {
  if (tier === "PLATINUM") return "bg-rose-50 text-rose-700";
  if (tier === "GOLD") return "bg-amber-50 text-amber-700";
  if (tier === "SILVER") return "bg-violet-50 text-violet-700";
  return "bg-sky-50 text-sky-700";
}

function tierProgressClass(tier: string) {
  if (tier === "PLATINUM") return "bg-rose-500";
  if (tier === "GOLD") return "bg-amber-500";
  if (tier === "SILVER") return "bg-violet-500";
  return "bg-sky-500";
}

function offerBorderClass(accent: TierVoucherOffer["accent"]) {
  if (accent === "rose") return "border-rose-200 hover:border-rose-300";
  if (accent === "amber") return "border-amber-200 hover:border-amber-300";
  if (accent === "violet") return "border-violet-200 hover:border-violet-300";
  return "border-sky-200 hover:border-sky-300";
}

function offerIconClass(accent: TierVoucherOffer["accent"]) {
  if (accent === "rose") return "bg-rose-50 text-rose-700";
  if (accent === "amber") return "bg-amber-50 text-amber-700";
  if (accent === "violet") return "bg-violet-50 text-violet-700";
  return "bg-sky-50 text-sky-700";
}

function offerBadgeClass(accent: TierVoucherOffer["accent"]) {
  if (accent === "rose") return "border-rose-200 bg-rose-50 text-rose-700";
  if (accent === "amber") return "border-amber-200 bg-amber-50 text-amber-700";
  if (accent === "violet") return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function tierRuleBadgeClass(tier: string) {
  if (tier === "PLATINUM") return "border-rose-200 bg-rose-50 text-rose-700";
  if (tier === "GOLD") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tier === "SILVER") return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}
