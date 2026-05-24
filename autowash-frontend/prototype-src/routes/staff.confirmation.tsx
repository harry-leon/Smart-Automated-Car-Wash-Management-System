import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Gift, Printer, ArrowRight, Sparkles, Receipt } from "lucide-react";
import { AccessDenied } from "@/components/access-denied";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/access-control";
import { getHomePath } from "@/lib/auth";
import { useCarwashStore } from "@/lib/carwash-store";
import { fmtMoney, useWashStore } from "@/lib/wash-store";
import { toast } from "sonner";
import { PageHeader, TierBadge } from "@/components/shared";
import { RouteRedirect } from "@/components/route-redirect";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staff/confirmation")({
  component: () => <ConfirmationPage />,
});

export function ConfirmationPage() {
  const { role } = useCarwashStore();
  const { lastTransaction, customers } = useWashStore();
  const navigate = useNavigate();

  if (!canAccess(role, ["Staff"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Confirmation access is restricted"
          description="Only Staff roles can view the checkout confirmation screen."
          role={role}
        />
      </div>
    );
  }

  if (!lastTransaction) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <PageHeader
          title="No recent transaction"
          subtitle="Complete a checkout to see the receipt."
        />
        <Button
          asChild
          className="mt-8 rounded-xl font-bold px-8 shadow-md transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <Link to="/staff/dashboard">
            Start a new wash <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }

  const tx = lastTransaction;
  const current =
    tx.customer.id !== "guest"
      ? customers.find((customer) => customer.id === tx.customer.id)
      : null;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-2xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl animate-in zoom-in duration-500 hover:scale-105 transition-transform">
            <Check className="h-12 w-12" strokeWidth={3} />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Payment Successful</h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground bg-background/50 px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
          Transaction{" "}
          <span className="font-mono text-foreground font-bold tracking-wider">{tx.id}</span> • Paid
          via <span className="text-foreground font-bold">{tx.paymentMethod}</span>
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-5 items-start">
        <div className="md:col-span-3 rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Receipt
              </h3>
              <TierBadge tier={tx.customer.tier} />
            </div>

            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between items-center rounded-lg bg-background/50 p-3 border border-border/50">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">
                  Customer
                </span>
                <span className="font-bold text-foreground text-base">{tx.customer.name}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-background/50 p-3 border border-border/50">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">
                  Vehicle
                </span>
                <span className="font-bold text-foreground">
                  {tx.vehicleType} / <span className="font-mono tracking-wider">{tx.plate}</span>
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg bg-background/50 p-3 border border-border/50">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">
                  Date
                </span>
                <span className="font-medium text-foreground">
                  {new Date(tx.date).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/50 pt-6 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Services
              </div>
              {tx.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center px-2">
                  <span className="font-medium">{service.name}</span>
                  <span className="font-bold">{fmtMoney(service.price)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-border/50 pt-6 text-sm bg-background/30 p-4 rounded-xl">
              <Line label="Subtotal" value={fmtMoney(tx.subtotal)} />
              {tx.tierDiscount > 0 && (
                <Line
                  label={`Tier discount (${tx.customer.discountPct}%)`}
                  value={`-${fmtMoney(tx.tierDiscount)}`}
                  emerald
                />
              )}
              {tx.promoDiscount > 0 && (
                <Line
                  label={`Promo ${tx.promoCode}`}
                  value={`-${fmtMoney(tx.promoDiscount)}`}
                  emerald
                />
              )}
              {tx.pointsValue > 0 && (
                <Line
                  label={`Points used (${tx.pointsRedeemed})`}
                  value={`-${fmtMoney(tx.pointsValue)}`}
                  emerald
                />
              )}
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-border/50 pt-6">
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Final paid
              </span>
              <span className="text-4xl font-bold tracking-tight text-emerald-600">
                {fmtMoney(tx.finalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-primary to-indigo-700 p-8 text-primary-foreground shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover:scale-150" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-90 mb-4">
                <Sparkles className="h-4 w-4" /> Loyalty Rewards
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <Gift className="h-8 w-8 opacity-90" />
                <span className="text-5xl font-bold tracking-tight">+{tx.pointsEarned}</span>
                <span className="text-sm font-bold uppercase tracking-wider opacity-80">pts</span>
              </div>
              <div className="mt-6 border-t border-white/20 pt-5 text-sm">
                {tx.customer.id === "guest" ? (
                  <span className="opacity-90 font-medium">Sign up to start earning points!</span>
                ) : (
                  <div className="flex justify-between items-center bg-black/10 rounded-lg p-3 backdrop-blur-sm">
                    <span className="opacity-90 font-bold uppercase tracking-wider text-xs">
                      New balance
                    </span>
                    <span className="font-bold text-lg">{current?.points ?? 0} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-6 shadow-lg space-y-4">
            <Button
              className="w-full h-14 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all"
              onClick={() => {
                toast.success("Receipt sent to printer");
                if (typeof window !== "undefined") window.print();
              }}
            >
              <Printer className="mr-2 h-5 w-5" /> Print Receipt
            </Button>
            <Button
              variant="secondary"
              className="w-full h-12 rounded-xl font-bold bg-secondary/50 hover:bg-secondary shadow-sm transition-all"
              onClick={() => navigate({ to: getHomePath(role) })}
            >
              Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-bold border-border/50 hover:bg-background shadow-sm transition-all"
              asChild
            >
              <Link to="/staff/dashboard">Start another wash</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, emerald }: { label: string; value: string; emerald?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span
        className={cn(
          "font-bold",
          emerald
            ? "text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
            : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
