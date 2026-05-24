import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  QrCode,
  Tag,
  XCircle,
} from "lucide-react";
import { AccessDenied } from "@/components/access-denied";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";
import { cn } from "@/lib/utils";
import { fmtMoney, useWashStore } from "@/lib/wash-store";
import { toast } from "sonner";
import { PageHeader, TierBadge } from "@/components/shared";
import { RouteRedirect } from "@/components/route-redirect";

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Credit Card", icon: CreditCard },
  { id: "qr", label: "Bank Transfer QR", icon: QrCode },
];

export function CheckoutPage() {
  const { role } = useCarwashStore();
  const { draft, promotions, completeCheckout, setDraft } = useWashStore();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = React.useState("");
  const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = React.useState(0);
  const [payment, setPayment] = React.useState("card");
  const [processing, setProcessing] = React.useState(false);

  if (!canAccess(role, ["Staff", "Admin"])) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <AccessDenied
          title="Checkout access is restricted"
          description="Only Staff and Admin roles can complete payment and checkout."
          role={role}
        />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <PageHeader title="No active session" subtitle="Start a wash session first." />
        <Button
          asChild
          className="mt-8 rounded-xl font-bold px-8 shadow-md transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <Link to="/staff/wash-session">
            <ArrowLeft className="mr-2 h-4 w-4" /> Start a new wash
          </Link>
        </Button>
      </div>
    );
  }

  const subtotal = draft.services.reduce((sum, service) => sum + service.price, 0);
  const tierDiscount = Math.round(subtotal * (draft.customer.discountPct / 100));
  const promo = promotions.find((item) => item.code === appliedPromo && item.active) ?? null;
  const afterTier = subtotal - tierDiscount;
  const promoDiscount = promo
    ? promo.discountType === "Percentage"
      ? Math.round(afterTier * (promo.amount / 100))
      : Math.min(promo.amount, afterTier)
    : 0;
  const afterPromo = Math.max(0, afterTier - promoDiscount);
  const maxRedeemableByPoints = draft.customer.points;
  const maxRedeemableByPrice = Math.floor(afterPromo / 1000);
  const maxRedeem = Math.min(maxRedeemableByPoints, maxRedeemableByPrice);
  const safePoints = Math.min(pointsToRedeem, maxRedeem);
  const pointsValue = safePoints * 1000;
  const finalAmount = Math.max(0, afterPromo - pointsValue);
  const pointsEarned = Math.floor(
    Math.floor(finalAmount / 10000) * (draft.customer.multiplier ?? 1),
  );

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const matched = promotions.find(
      (item) =>
        item.code === code &&
        item.active &&
        item.tiers.includes(draft.customer.tier === "Guest" ? "Member" : draft.customer.tier),
    );
    if (!matched) {
      setAppliedPromo(null);
      setPromoError("Invalid or unavailable promo code for current tier");
      toast.error("Invalid or unavailable promo code");
      return;
    }
    setAppliedPromo(code);
    setPromoError(null);
    toast.success(`Promo "${code}" applied`);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  const processPayment = () => {
    if (processing) return;
    setProcessing(true);
    const tx = completeCheckout({
      promoCode: appliedPromo,
      pointsRedeemed: safePoints,
      paymentMethod: PAYMENT_METHODS.find((item) => item.id === payment)?.label ?? payment,
    });
    if (!tx) {
      setProcessing(false);
      toast.error("No active wash session available for checkout.");
      return;
    }
    toast.success(`Payment processed for ${tx.id}`);
    setDraft(null);
    navigate({ to: "/staff/confirmation" });
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 border-b border-border/50 pb-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Apply discounts, redeem points, and collect payment.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Section title="Order Summary">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="text-base font-bold text-foreground">{draft.customer.name}</span>
              <TierBadge tier={draft.customer.tier} />
              <span className="inline-flex items-center rounded-lg bg-accent/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {draft.vehicleType} / <span className="ml-1 text-primary">{draft.plate}</span>
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-background/50 shadow-inner">
              {draft.services.map((service) => (
                <div
                  key={service.id}
                  className="flex justify-between items-center border-b border-border/50 px-5 py-4 text-sm last:border-b-0 transition-colors hover:bg-background"
                >
                  <span className="font-bold">{service.name}</span>
                  <span className="font-bold text-primary">{fmtMoney(service.price)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center bg-primary/5 px-5 py-4 text-sm border-t border-border/50">
                <span className="font-bold uppercase tracking-wider text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-base font-bold">{fmtMoney(subtotal)}</span>
              </div>
            </div>
          </Section>

          <Section title="Tier Discount">
            {draft.customer.tier === "Guest" ? (
              <p className="text-sm font-medium text-muted-foreground rounded-xl bg-background/50 p-4 border border-border/50">
                Guest checkout - no member discount applied.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm transition-all hover:bg-emerald-500/10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span>
                    <strong className="text-foreground">{draft.customer.tier} Membership</strong>{" "}
                    applied -{" "}
                    <span className="font-bold text-emerald-600">
                      {draft.customer.discountPct}%
                    </span>
                  </span>
                </div>
                <span className="text-base font-bold text-emerald-600 self-end sm:self-auto">
                  -{fmtMoney(tierDiscount)}
                </span>
              </div>
            )}
          </Section>

          <Section title="Promo Code">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  placeholder="Enter promotion code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-border/50 bg-background/50 shadow-sm font-mono text-base font-bold uppercase tracking-widest transition-all focus:bg-background"
                  disabled={!!appliedPromo}
                />
              </div>
              {appliedPromo ? (
                <Button
                  variant="outline"
                  onClick={removePromo}
                  className="h-12 rounded-xl font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  Remove
                </Button>
              ) : (
                <Button onClick={applyPromo} className="h-12 rounded-xl font-bold px-6 shadow-sm">
                  Apply
                </Button>
              )}
            </div>
            {appliedPromo && (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
                Code <span className="font-mono">{appliedPromo}</span> active
              </div>
            )}
            {promoError && (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-destructive bg-destructive/10 w-fit px-3 py-1.5 rounded-lg border border-destructive/20">
                <XCircle className="h-4 w-4" />
                {promoError}
              </div>
            )}
          </Section>

          <Section title="Loyalty Points">
            {draft.customer.tier === "Guest" ? (
              <p className="text-sm font-medium text-muted-foreground rounded-xl bg-background/50 p-4 border border-border/50">
                Guests cannot redeem loyalty points.
              </p>
            ) : (
              <div className="rounded-xl border border-border/50 bg-background/30 p-5 shadow-inner">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    Available:{" "}
                    <span className="text-base text-foreground bg-background px-2 py-0.5 rounded-md border border-border/50 shadow-sm">
                      {draft.customer.points} pts
                    </span>
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    1 pt = 1.000 VND
                  </span>
                </div>
                <div className="px-2">
                  <Slider
                    value={[safePoints]}
                    max={Math.max(maxRedeem, 1)}
                    step={1}
                    onValueChange={(value) => setPointsToRedeem(value[0])}
                    disabled={maxRedeem === 0}
                    className="py-4"
                  />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 bg-background p-4 rounded-xl border border-border/50 shadow-sm">
                  <Label htmlFor="pts" className="text-sm font-bold uppercase tracking-wider">
                    Redeem
                  </Label>
                  <Input
                    id="pts"
                    type="number"
                    min={0}
                    max={maxRedeem}
                    step={1}
                    value={safePoints}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value) || 0)}
                    className="w-32 h-10 font-bold text-center rounded-lg"
                  />
                  <div className="flex items-center gap-2 text-sm font-bold ml-auto">
                    <span className="text-muted-foreground">pts {"->"}</span>
                    <span className="text-base text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-sm">
                      -{fmtMoney(pointsValue)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Section>

          <Section title="Payment Method">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PAYMENT_METHODS.map((method) => {
                const active = payment === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPayment(method.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 rounded-xl border p-5 transition-all duration-300",
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md scale-[1.02]"
                        : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-background hover:-translate-y-1 hover:shadow-sm",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8 transition-colors",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="text-sm font-bold">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/50 pb-4 mb-6">
              Final Bill
            </div>
            <div className="space-y-4 text-sm">
              <Row label="Subtotal" value={fmtMoney(subtotal)} />
              {tierDiscount > 0 && (
                <Row
                  label={`Tier (-${draft.customer.discountPct}%)`}
                  value={`-${fmtMoney(tierDiscount)}`}
                  emerald
                />
              )}
              {promoDiscount > 0 && (
                <Row
                  label={`Promo ${appliedPromo}`}
                  value={`-${fmtMoney(promoDiscount)}`}
                  emerald
                />
              )}
              {pointsValue > 0 && (
                <Row
                  label={`Points (${safePoints} pts)`}
                  value={`-${fmtMoney(pointsValue)}`}
                  emerald
                />
              )}
            </div>
            <div className="mt-6 flex flex-col gap-2 border-t border-border/50 pt-6">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Payable
                </span>
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {fmtMoney(finalAmount)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 self-end rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-500/20">
                Est. points earned: <span className="text-base">+ {pointsEarned}</span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <Button
                className="w-full h-14 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                onClick={processPayment}
                disabled={processing}
              >
                {processing ? "Processing..." : "Process Payment"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-xl font-bold border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-all"
              >
                <Link to="/staff/wash-session">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to wash details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden group">
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-150" />
      <div className="relative z-10">
        <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-foreground">{title}</h3>
        {children}
      </div>
    </section>
  );
}

function Row({ label, value, emerald }: { label: string; value: string; emerald?: boolean }) {
  return (
    <div className="flex justify-between items-center p-2 rounded-lg transition-colors hover:bg-background/50 -mx-2">
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className={cn("font-bold text-base", emerald ? "text-emerald-600" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}
