import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Wind,
  CircleDot,
  Ticket,
  TrendingUp,
  TrendingDown,
  Crown,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { canAccess } from "@/lib/access-control";
import { getPointSnapshotForCustomer, useCarwashStore } from "@/lib/carwash-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLoyalty, tierGradient, tierBadgeClass, Reward } from "@/lib/loyalty-store";

const REWARD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind,
  CircleDot,
  Ticket,
};

export function LoyaltyPage() {
  const { role } = useCarwashStore();
  const { customers, activeCustomerId, tiers, ledger, rewards, redeemReward } = useLoyalty();
  const customer = customers.find((item) => item.id === activeCustomerId)!;

  if (!canAccess(role, ["Customer", "Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Loyalty access is restricted"
          description="Only Customer and Admin roles can review or redeem loyalty rewards."
          role={role}
        />
      </div>
    );
  }

  const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  const currentIdx = sortedTiers.findIndex((tier) => tier.name === customer.tier);
  const nextTier = sortedTiers[currentIdx + 1];
  const base = sortedTiers[currentIdx]?.threshold ?? 0;
  const target = nextTier?.threshold ?? customer.points;
  const pct = nextTier
    ? Math.min(100, Math.round(((customer.points - base) / (target - base)) * 100))
    : 100;
  const customerLedger = ledger.filter((item) => item.customerId === customer.id);
  const pointSnapshot = getPointSnapshotForCustomer(ledger, customer.id);

  const handleRedeem = (reward: Reward) => {
    if (customer.points < reward.cost) {
      toast.error("Not enough points", {
        description: `You need ${reward.cost - customer.points} more points.`,
      });
      return;
    }
    const ok = redeemReward(customer.id, reward);
    if (ok) {
      toast.success(`${reward.name} redeemed!`, {
        description: `-${reward.cost} pts deducted from your balance.`,
      });
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-gradient-to-r p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10",
            tierGradient(customer.tier),
          )}
        >
          {/* Decorative glows */}
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay" />
          <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-black/10 blur-3xl mix-blend-overlay" />

          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:flex lg:items-start lg:justify-between">
            {/* Col 1 */}
            <div className="flex-1 lg:border-r border-white/20 lg:pr-6">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/80">
                <Crown className="h-3.5 w-3.5" /> MEMBER
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {customer.tier} Member
              </div>
              <div className="mt-1 text-xs font-medium text-white/70">
                Since {new Date("2025-02-15").toLocaleDateString("en-GB")}
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex-1 lg:border-r border-white/20 lg:px-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                CURRENT POINTS
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-bold tracking-tight drop-shadow-sm">
                {customer.points.toLocaleString()} <span className="text-lg font-medium">pts</span>
              </div>
              <div className="mt-1 text-xs font-medium text-white/70">
                ≈ {(customer.points * 100).toLocaleString()} VND
              </div>
            </div>

            {/* Col 3 */}
            <div className="flex-1 lg:border-r border-white/20 lg:px-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                NEXT TIER
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-bold text-amber-300 drop-shadow-sm tracking-tight">
                {nextTier?.name ?? "Max"}
              </div>
              <div className="mt-1 text-xs font-medium text-white/70">
                {nextTier
                  ? `${(target - customer.points).toLocaleString()} pts remaining`
                  : "Top tier reached"}
              </div>
            </div>

            {/* Col 4 */}
            <div className="flex-1 lg:pl-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                POINTS EXPIRY
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-bold tracking-tight drop-shadow-sm">
                {pointSnapshot.nextExpiryDate
                  ? new Date(pointSnapshot.nextExpiryDate).toLocaleDateString("en-GB")
                  : "No expiry"}
              </div>
              <div className="mt-1 text-xs font-medium text-white/70">
                {pointSnapshot.nextExpiryDate
                  ? `${pointSnapshot.expiringIn30Days.toLocaleString()} pts within 30 days`
                  : "No points close to expiry"}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10">
            {nextTier ? (
              <>
                <div className="mb-2.5 flex items-center justify-between text-sm font-semibold text-white/90">
                  <span>Progress to {nextTier.name} tier</span>
                  <span>
                    {customer.points.toLocaleString()} / {target.toLocaleString()} pts
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/20 p-0.5">
                  <div
                    className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md">
                <Sparkles className="h-4 w-4" /> Platinum perks unlocked
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Rewards Marketplace
              </h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {rewards.length} perks available
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rewards.map((reward) => {
                const Icon = REWARD_ICONS[reward.icon] ?? Gift;
                const affordable = customer.points >= reward.cost;
                return (
                  <Card
                    key={reward.id}
                    className="group relative overflow-hidden rounded-[1.5rem] border-border/50 bg-card/60 p-1 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardContent className="relative z-10 p-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="mt-5 text-base font-bold text-foreground">{reward.name}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        <Sparkles className="h-3.5 w-3.5" /> {reward.cost} pts
                      </div>
                      <Button
                        size="sm"
                        className="mt-6 w-full rounded-xl font-bold shadow-sm transition-all"
                        variant={affordable ? "default" : "secondary"}
                        disabled={!affordable}
                        onClick={() => handleRedeem(reward)}
                      >
                        {affordable ? "Redeem Reward" : "Not enough points"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground px-2">Your Perks</h2>
              <Card className="rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-lg">
                <CardContent className="p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Current Benefits
                  </div>
                  <Badge
                    className={cn(
                      "px-3 py-1 text-sm font-bold shadow-sm",
                      tierBadgeClass(customer.tier),
                    )}
                  >
                    {customer.tier} Tier
                  </Badge>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-foreground/90">
                    {tiers.find((tier) => tier.name === customer.tier)?.perks}
                  </p>
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-accent/30 p-3 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Earning rate ×{tiers.find((tier) => tier.name === customer.tier)?.multiplier}
                  </div>
                  {nextTier && (
                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                        <span>Progress to {nextTier.name}</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2 bg-accent/50" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground px-2">
                Point Ledger
              </h2>
              <Card className="rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <ul className="divide-y divide-border/50">
                    {customerLedger.length === 0 && (
                      <li className="p-8 text-center text-sm font-medium text-muted-foreground">
                        No activity yet.
                      </li>
                    )}
                    {customerLedger.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center gap-4 p-5 transition-colors hover:bg-accent/20"
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-inner",
                            entry.delta > 0
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-rose-500/10 text-rose-600",
                          )}
                        >
                          {entry.delta > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-foreground">
                            {entry.description}
                          </div>
                          <div className="mt-1 text-xs font-medium text-muted-foreground">
                            {entry.date}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={cn(
                              "text-base font-bold tabular-nums tracking-tight",
                              entry.delta > 0 ? "text-emerald-600" : "text-rose-600",
                            )}
                          >
                            {entry.delta > 0 ? "+" : ""}
                            {entry.delta}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold uppercase tracking-wider bg-background/50"
                          >
                            {entry.type}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
