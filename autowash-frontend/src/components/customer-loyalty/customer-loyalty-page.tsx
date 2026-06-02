"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Gift,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import {
  buildLoyaltySummary,
  formatLoyaltyPoints,
  formatLoyaltyTransactionType,
  formatTierLabel,
} from "@/lib/customer-loyalty";
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
  useCustomerRedeemPoints,
} from "@/hooks/use-customer-loyalty";
import { cn } from "@/lib/utils";
import type { TierVoucherOffer } from "@/types/loyalty.types";

type VoucherOfferState = TierVoucherOffer & {
  eligible: boolean;
  affordable: boolean;
};

const TIER_ORDER = ["MEMBER", "SILVER", "GOLD", "PLATINUM"] as const;

const REDEEM_RULES = [
  { tier: "MEMBER", value: "50 pts → 50,000 VND" },
  { tier: "SILVER", value: "100 pts → 120,000 VND" },
  { tier: "GOLD", value: "150 pts → 210,000 VND" },
  { tier: "PLATINUM", value: "200 pts → 320,000 VND" },
] as const;

export function CustomerLoyaltyPageContent() {
  const accountQuery = useCustomerLoyaltyAccount();
  const transactionsQuery = useCustomerLoyaltyTransactions(1, 5);
  const redeemMutation = useCustomerRedeemPoints();
  const [selectedOffer, setSelectedOffer] = useState<VoucherOfferState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const summary = useMemo(
    () => (accountQuery.data ? buildLoyaltySummary(accountQuery.data) : null),
    [accountQuery.data],
  );

  const handleRedeem = () => {
    if (!selectedOffer || !summary) {
      return;
    }

    setSuccessMessage(null);
    redeemMutation.mutate(
      {
        pointsToRedeem: selectedOffer.pointsCost,
        referenceId: `loyalty-voucher:${selectedOffer.id}`,
      },
      {
        onSuccess: (response) => {
          setSuccessMessage(
            `${selectedOffer.title} has been redeemed. New balance: ${response.newBalance.toLocaleString("en-US")} pts.`,
          );
          setSelectedOffer(null);
        },
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
    ? Math.max(summary.currentPoints - selectedOffer.pointsCost, 0)
    : summary.currentPoints;

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
                    {summary.currentPoints.toLocaleString("en-US")} pts
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
              <MetricTile icon={Wallet} label="Current balance" value={`${summary.currentPoints.toLocaleString("en-US")} pts`} />
              <MetricTile icon={Sparkles} label="Total earned" value={`${summary.totalEarnedPoints.toLocaleString("en-US")} pts`} />
              <MetricTile icon={ShieldCheck} label="Completed washes" value={String(summary.completedWashCount)} />
            </div>

            <div className="mt-7 rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Tier progress</div>
                  <div className="mt-2 text-lg font-black text-slate-950">{summary.progress.progressPercent}% complete</div>
                  {summary.progress.nextTier ? (
                    <div className="mt-1 text-sm text-slate-600">
                      {`${summary.currentPoints.toLocaleString("en-US")} / ${(summary.currentPoints + summary.progress.pointsToNextTier).toLocaleString("en-US")} pts`}
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
                      {summary.currentPoints.toLocaleString("en-US")} / {(summary.currentPoints + summary.progress.pointsToNextTier).toLocaleString("en-US")} pts
                    </span>
                  ) : (
                    <span>At the highest tier</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {successMessage}
          </div>
        ) : null}

        {redeemMutation.isError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {getDisplayErrorMessage(redeemMutation.error)}
          </div>
        ) : null}

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
              <p className="mt-2 text-sm text-slate-600">Voucher value scales with membership tier.</p>

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
                Points can be redeemed at your current tier or any higher tier reward.
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

      <Dialog open={Boolean(selectedOffer)} onOpenChange={(open) => !open && setSelectedOffer(null)}>
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
              <RuleRow label="Current balance" value={`${summary.currentPoints.toLocaleString("en-US")} pts`} />
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

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
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

function tierStepClass(tier: string) {
  if (tier === "PLATINUM") return "border-rose-200 bg-rose-50 text-rose-700";
  if (tier === "GOLD") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tier === "SILVER") return "border-violet-200 bg-violet-50 text-violet-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
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
