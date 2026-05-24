import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Inbox, Receipt, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";
import { Transaction, fmtMoney, useWashStore } from "@/lib/wash-store";
import { PageHeader, TierBadge } from "@/components/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transactions")({
  component: () => <RouteRedirect to="/customer/transactions" />,
});

export function HistoryPage() {
  const { role } = useCarwashStore();
  const { transactions } = useWashStore();
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");
  const [active, setActive] = React.useState<Transaction | null>(null);

  if (!canAccess(role, ["Customer", "Admin"])) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <AccessDenied
          title="Transaction history is restricted"
          description="Only Customer and Admin roles can review transaction receipts in this module."
          role={role}
        />
      </div>
    );
  }

  const filtered = transactions.filter((t) => {
    const matchPlate = t.plate.toLowerCase().includes(search.trim().toLowerCase());
    const matchTier = tierFilter === "all" || t.customer.tier === tierFilter;
    return matchPlate && matchTier;
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
          Transaction History
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Audit log of every completed wash session.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-border/50 bg-card/60 shadow-xl backdrop-blur-xl transition-all duration-300">
        <div className="flex flex-col gap-4 border-b border-border/50 bg-accent/20 p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by license plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 focus-visible:border-primary font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 items-center justify-center rounded-xl border border-border/60 bg-background/50 px-3 text-muted-foreground shadow-sm">
              <Filter className="h-4 w-4" />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="h-11 w-[180px] rounded-xl border-border/60 bg-background/50 shadow-sm transition-all focus:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-card/90 backdrop-blur-xl">
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/30 mb-6">
              <Inbox className="h-10 w-10 opacity-50" />
            </div>
            <div className="text-base font-semibold text-foreground">No transactions found</div>
            <div className="mt-1 text-sm max-w-xs">
              {transactions.length === 0
                ? "You haven't completed any wash sessions yet."
                : "Try adjusting your filters or search term."}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <Th className="pl-6">Date</Th>
                  <Th>Transaction</Th>
                  <Th>Customer</Th>
                  <Th>Plate</Th>
                  <Th className="text-right">Final</Th>
                  <Th className="text-right">Points</Th>
                  <Th className="pr-6">Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setActive(t)}
                    className="group cursor-pointer transition-colors hover:bg-primary/5"
                  >
                    <Td className="pl-6 whitespace-nowrap text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                      {new Date(t.date).toLocaleString()}
                    </Td>
                    <Td>
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider shadow-sm transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                        <Receipt className="h-3 w-3" />
                        {t.id}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t.customer.name}</span>
                        <TierBadge tier={t.customer.tier} />
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono font-bold tracking-wider text-foreground">
                        {t.plate}
                      </span>
                    </Td>
                    <Td className="text-right font-bold text-foreground">
                      {fmtMoney(t.finalAmount)}
                    </Td>
                    <Td className="text-right">
                      <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        +{t.pointsEarned}
                      </span>
                    </Td>
                    <Td className="pr-6">
                      <Badge className="border-emerald-200/50 bg-emerald-500/10 text-emerald-700 shadow-sm hover:bg-emerald-500/20">
                        Completed
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md border-l border-border/50 bg-card/95 backdrop-blur-2xl shadow-2xl p-0">
          {active && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-border/50 bg-accent/20">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                    <Receipt className="h-5 w-5 text-primary" />
                    Receipt {active.id}
                  </SheetTitle>
                  <SheetDescription className="font-medium mt-1 text-xs uppercase tracking-wider">
                    {new Date(active.date).toLocaleString()}{" "}
                    <span className="mx-2 opacity-50">•</span> {active.paymentMethod}
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">
                      {active.customer.name}
                    </span>
                    <TierBadge tier={active.customer.tier} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span>{active.vehicleType}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {active.plate}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                    Services
                  </div>
                  <div className="space-y-3 mt-4">
                    {active.services.map((s) => (
                      <div key={s.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-foreground/90">{s.name}</span>
                        <span className="font-semibold">{fmtMoney(s.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/50 bg-accent/10 p-5 shadow-sm">
                  <Line label="Subtotal" value={fmtMoney(active.subtotal)} />
                  {active.tierDiscount > 0 && (
                    <Line
                      label="Tier discount"
                      value={`-${fmtMoney(active.tierDiscount)}`}
                      emerald
                    />
                  )}
                  {active.promoDiscount > 0 && (
                    <Line
                      label={`Promo ${active.promoCode}`}
                      value={`-${fmtMoney(active.promoDiscount)}`}
                      emerald
                    />
                  )}
                  {active.pointsValue > 0 && (
                    <Line
                      label={`Points (${active.pointsRedeemed})`}
                      value={`-${fmtMoney(active.pointsValue)}`}
                      emerald
                    />
                  )}
                  <div className="pt-3 mt-3 border-t border-border/50 flex justify-between items-end">
                    <span className="font-bold text-foreground">Total paid</span>
                    <span className="text-2xl font-black text-primary">
                      {fmtMoney(active.finalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-emerald-200/50 bg-emerald-500/10 p-4 shadow-sm text-emerald-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium">
                    Earned <strong className="font-bold">+{active.pointsEarned} pts</strong> on this
                    transaction.
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-4 text-left font-bold text-[10px]", className)}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-4 align-middle", className)}>{children}</td>;
}

function Line({ label, value, emerald }: { label: string; value: string; emerald?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold",
          emerald ? "text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
