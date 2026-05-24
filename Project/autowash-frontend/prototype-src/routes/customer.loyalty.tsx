import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Copy, Crown, Gift, Lock, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCarwashStore, type Tier } from "@/lib/carwash-store";

export const Route = createFileRoute("/customer/loyalty")({
  component: CustomerLoyaltyPage,
});

const TIER_COLORS: Record<Tier, string> = {
  Member: "#CD7F32",
  Silver: "#A8A9AD",
  Gold: "#FFD700",
  Platinum: "#E5E4E2",
};

export function CustomerLoyaltyPage() {
  const {
    currentCustomerId,
    customers,
    voucherTemplates,
    customerVouchers,
    redeemVoucherTemplate,
  } = useCarwashStore();
  const [tab, setTab] = React.useState("catalog");
  const [mode, setMode] = React.useState<"all" | "redeemable">("all");
  const [redeemingId, setRedeemingId] = React.useState<string | null>(null);

  const customer = customers.find((item) => item.id === currentCustomerId) ?? customers[0];
  const myVouchers = React.useMemo(
    () => customerVouchers.filter((voucher) => voucher.customerId === customer.id),
    [customer.id, customerVouchers],
  );

  const visibleTemplates = React.useMemo(() => {
    const base = voucherTemplates.filter((template) => template.active || mode === "all");
    if (mode === "all") return base;
    return base.filter(
      (template) =>
        tierRank(customer.tier) >= tierRank(template.minTier) &&
        customer.points >= template.pointCost,
    );
  }, [customer.points, customer.tier, mode, voucherTemplates]);

  const nextTier = getNextTier(customer.tier);
  const nextTierGoal = nextTier ? tierThreshold(nextTier) : customer.points;
  const currentTierFloor = tierThreshold(customer.tier);
  const progress = nextTier
    ? Math.min(
        100,
        Math.round(
          ((customer.points - currentTierFloor) / (nextTierGoal - currentTierFloor)) * 100,
        ),
      )
    : 100;
  const pointsNeeded = nextTier ? Math.max(0, nextTierGoal - customer.points) : 0;

  const handleRedeem = async (templateId: string) => {
    try {
      setRedeemingId(templateId);
      await new Promise((resolve) => setTimeout(resolve, 200));
      const voucher = redeemVoucherTemplate(customer.id, templateId);
      toast.success(`${voucher.name} redeemed. Code ${voucher.code}`);
      setTab("my-vouchers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to redeem voucher.");
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="rounded-xl shadow-md">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-4">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900"
                  style={{ backgroundColor: `${TIER_COLORS[customer.tier]}33` }}
                >
                  <Crown className="h-3.5 w-3.5" style={{ color: TIER_COLORS[customer.tier] }} />
                  {customer.tier} rank
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Loyalty ranks and voucher redemption
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
                    Your points unlock higher ranks and reusable voucher templates. Redeemed voucher
                    codes stay in one place for checkout.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Current points
                      </div>
                      <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                        {customer.points.toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Wallet
                      </div>
                      <div className="mt-1 text-lg font-semibold text-foreground">
                        {formatMoney(customer.walletBalance ?? 0)}
                      </div>
                    </div>
                  </div>
                  <Progress value={progress} className="mt-4 h-2" />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {nextTier
                      ? `${pointsNeeded.toLocaleString("vi-VN")} points to ${nextTier}`
                      : "Top tier reached"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Metric label="Rank" value={customer.tier} />
                <Metric label="Redeemed vouchers" value={`${myVouchers.length}`} />
                <Metric
                  label="Redeemable now"
                  value={`${
                    voucherTemplates.filter(
                      (template) =>
                        template.active &&
                        tierRank(customer.tier) >= tierRank(template.minTier) &&
                        customer.points >= template.pointCost,
                    ).length
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-muted/70 p-1">
              <TabsTrigger value="catalog">Voucher catalog</TabsTrigger>
              <TabsTrigger value="my-vouchers">My vouchers</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={mode === "all" ? "default" : "outline"}
                  onClick={() => setMode("all")}
                >
                  All vouchers
                </Button>
                <Button
                  variant={mode === "redeemable" ? "default" : "outline"}
                  onClick={() => setMode("redeemable")}
                >
                  Redeemable
                </Button>
              </div>
              {visibleTemplates.length === 0 ? (
                <EmptyState message="No voucher templates available for this filter." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleTemplates.map((template) => {
                    const rankLocked = tierRank(customer.tier) < tierRank(template.minTier);
                    const pointLocked = customer.points < template.pointCost;
                    const disabled = rankLocked || pointLocked || !template.active;
                    return (
                      <Card key={template.id} className="rounded-xl shadow-md">
                        <CardContent className="space-y-4 p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-lg font-semibold text-foreground">
                                {template.name}
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {template.discountLabel}
                              </div>
                            </div>
                            <Gift className="h-5 w-5 text-primary" />
                          </div>

                          <div className="grid gap-3 text-sm text-muted-foreground">
                            <InfoRow label="Point cost" value={`${template.pointCost} pts`} />
                            <InfoRow label="Minimum rank" value={template.minTier} />
                            <InfoRow label="Expiry" value={`${template.expiryDays} days`} />
                            <InfoRow
                              label="Status"
                              value={template.active ? "Active" : "Inactive"}
                            />
                          </div>

                          {rankLocked || pointLocked ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  <Lock className="h-3.5 w-3.5" />
                                  Locked
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {rankLocked
                                  ? `Requires ${template.minTier} tier`
                                  : "Not enough points yet"}
                              </TooltipContent>
                            </Tooltip>
                          ) : null}

                          <Button
                            className="w-full"
                            disabled={disabled || redeemingId === template.id}
                            onClick={() => handleRedeem(template.id)}
                          >
                            {redeemingId === template.id ? "Đang đổi..." : "Đổi ngay"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-vouchers" className="space-y-4">
              {myVouchers.length === 0 ? (
                <EmptyState message="No redeemed vouchers yet. Redeem one from the catalog to generate a code." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {myVouchers.map((voucher) => (
                    <Card key={voucher.id} className="rounded-xl shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between gap-3 text-base">
                          <span>{voucher.name}</span>
                          <StatusBadge status={voucher.status} />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Voucher code
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="font-mono text-base font-semibold text-foreground">
                              {voucher.code}
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={async () => {
                                await navigator.clipboard.writeText(voucher.code);
                                toast.success("Voucher code copied.");
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <InfoRow label="Discount" value={voucher.discountLabel} />
                        <InfoRow
                          label="Redeemed"
                          value={new Date(voucher.redeemedAt).toLocaleDateString()}
                        />
                        <InfoRow label="Expiry" value={voucher.expiresAt} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardContent className="p-6">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardContent className="p-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "USED" | "EXPIRED" }) {
  if (status === "USED") {
    return (
      <Badge className="bg-slate-100 text-slate-700">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Used
      </Badge>
    );
  }
  if (status === "EXPIRED") {
    return <Badge className="bg-rose-100 text-rose-700">Expired</Badge>;
  }
  return (
    <Badge className="bg-emerald-100 text-emerald-700">
      <Ticket className="mr-1 h-3.5 w-3.5" />
      Active
    </Badge>
  );
}

function tierThreshold(tier: Tier) {
  if (tier === "Platinum") return 4000;
  if (tier === "Gold") return 1500;
  if (tier === "Silver") return 500;
  return 0;
}

function getNextTier(tier: Tier): Tier | null {
  if (tier === "Member") return "Silver";
  if (tier === "Silver") return "Gold";
  if (tier === "Gold") return "Platinum";
  return null;
}

function tierRank(tier: Tier) {
  return ["Member", "Silver", "Gold", "Platinum"].indexOf(tier);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
