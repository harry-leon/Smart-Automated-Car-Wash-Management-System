"use client";

import Link from "next/link";
import { Gift, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import {
  buildLoyaltySummary,
  formatLoyaltyTransactionType,
  formatTierLabel,
} from "@/lib/customer-loyalty";
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
} from "@/hooks/use-customer-loyalty";

export function CustomerLoyaltyPageContent() {
  const accountQuery = useCustomerLoyaltyAccount();
  const transactionsQuery = useCustomerLoyaltyTransactions(1, 5);

  if (accountQuery.isPending) {
    return <div className="mx-auto h-80 max-w-7xl animate-pulse rounded-[2rem] bg-slate-100 px-4 py-6 sm:px-6 lg:px-8" />;
  }

  if (accountQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl border-rose-200 bg-white">
          <CardHeader>
            <CardTitle>Unable to load loyalty account</CardTitle>
            <CardDescription>{getDisplayErrorMessage(accountQuery.error)}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!accountQuery.data) {
    return null;
  }

  const summary = buildLoyaltySummary(accountQuery.data);

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#f6fffb_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <Gift className="h-3.5 w-3.5" />
                Loyalty account
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {summary.tierLabel} member status.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Track current points, completed washes, and progress toward the next tier using live wash-session data.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => accountQuery.refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/customer/promotions">View promotions</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <MetricCard label="Current points" value={summary.currentPoints.toLocaleString("vi-VN")} />
          <MetricCard label="Total earned" value={summary.totalEarnedPoints.toLocaleString("vi-VN")} />
          <MetricCard label="Completed washes" value={String(summary.completedWashCount)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-200/70 bg-slate-50/80">
              <CardTitle className="text-slate-900">Tier progress</CardTitle>
              <CardDescription>
                Mandatory-first tier thresholds follow the current prototype rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <InfoRow label="Current tier" value={formatTierLabel(summary.tier)} />
              <InfoRow
                label="Next tier"
                value={summary.progress.nextTier ? formatTierLabel(summary.progress.nextTier) : "Top tier reached"}
              />
              <InfoRow
                label="Points to next tier"
                value={summary.progress.pointsToNextTier.toLocaleString("vi-VN")}
              />
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Progress</span>
                  <span>{summary.progress.progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                    style={{ width: `${summary.progress.progressPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-200/70 bg-slate-50/80">
              <CardTitle className="text-slate-900">Recent point activity</CardTitle>
              <CardDescription>
                Latest earned-point entries after wash completion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {transactionsQuery.isPending ? (
                <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
              ) : transactionsQuery.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(transactionsQuery.error)}
                </div>
              ) : !transactionsQuery.data || transactionsQuery.data.items.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No point transactions yet.
                </div>
              ) : (
                transactionsQuery.data.items.map((item) => (
                  <div key={item.transactionId} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-slate-900">{formatLoyaltyTransactionType(item.type)}</div>
                      <div className="text-sm font-black text-emerald-700">+{item.points} pts</div>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                    <div className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("vi-VN")}</div>
                  </div>
                ))
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href="/customer/loyalty/history">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Open full point history
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardContent className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</div>
        <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
