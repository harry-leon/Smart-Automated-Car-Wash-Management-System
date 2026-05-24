import { createFileRoute } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access-denied";
import { canAccess } from "@/lib/access-control";
import { useAppStore } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarRange,
  Lock,
  ShieldAlert,
  Tag,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({
  component: () => <AnalyticsPage />,
});

const tiers = [
  { name: "Member", pct: 44, color: "bg-amber-600", count: 2128 },
  { name: "Silver", pct: 28, color: "bg-slate-400", count: 1354 },
  { name: "Gold", pct: 18, color: "bg-yellow-500", count: 870 },
  { name: "Platinum", pct: 10, color: "bg-fuchsia-500", count: 484 },
];

const promos = [
  { code: "WELCOME20", uses: 1240, revenue: 18420 },
  { code: "WASH5", uses: 980, revenue: 9700 },
  { code: "WEEKEND15", uses: 612, revenue: 11300 },
  { code: "LOYAL10", uses: 421, revenue: 6890 },
  { code: "REFER25", uses: 188, revenue: 4120 },
];

const transactions = [
  { id: "#TX-9821", customer: "John Doe", package: "Premium Foam", amount: 28, status: "Paid" },
  { id: "#TX-9820", customer: "Aiko Tanaka", package: "Express", amount: 12, status: "Paid" },
  { id: "#TX-9819", customer: "Carlos Mendes", package: "Detailing", amount: 89, status: "Paid" },
  {
    id: "#TX-9818",
    customer: "Jane Smith",
    package: "Premium Foam",
    amount: 28,
    status: "Refunded",
  },
  { id: "#TX-9817", customer: "Liam Park", package: "Express", amount: 12, status: "Paid" },
];

const maxPromo = Math.max(...promos.map((p) => p.uses));

function AnalyticsPage() {
  const { role } = useAppStore();

  if (!canAccess(role, ["Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Analytics are restricted"
          description="Only Admin can access executive analytics dashboards."
          role={role}
        />
      </div>
    );
  }
  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Executive Analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Weekly performance snapshot across revenue, bookings and loyalty.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md px-4 py-2 text-sm font-bold shadow-sm">
            <CalendarRange className="h-4 w-4 text-primary" />
            May 12 - May 18, 2026
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={BadgeDollarSign} label="Total Revenue" value="$48,290" delta="+12.4%" up />
          <Kpi icon={CalendarRange} label="Active Bookings" value="342" delta="+5.1%" up />
          <Kpi icon={Tag} label="Claimed Coupons" value="3,441" delta="+18.7%" up />
          <Kpi icon={TrendingUp} label="Avg Ticket Value" value="$24.10" delta="-1.2%" up={false} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Membership Demographics
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary shadow-sm">
                  4,836 members
                </span>
              </div>

              <div className="flex h-12 w-full overflow-hidden rounded-xl border border-border/50 shadow-inner">
                {tiers.map((t) => (
                  <div
                    key={t.name}
                    className={cn(
                      "flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-90",
                      t.color,
                    )}
                    style={{ width: `${t.pct}%` }}
                  >
                    {t.pct}%
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-5">
                {tiers.map((t) => (
                  <div key={t.name} className="group">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-3">
                        <span className={cn("h-3 w-3 rounded-full shadow-sm", t.color)} />
                        <span className="font-bold">{t.name}</span>
                      </span>
                      <span className="tabular-nums font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                        {t.count.toLocaleString()} members <span className="opacity-50">/</span>{" "}
                        {t.pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner">
                      <div
                        className={cn("h-full transition-all duration-1000 ease-out", t.color)}
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Promotion Efficiency
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 shadow-sm">
                  Top 5 codes
                </span>
              </div>
              <TooltipProvider delayDuration={100}>
                <div className="space-y-6">
                  {promos.map((p) => (
                    <div key={p.code} className="group">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-mono font-bold bg-background/50 px-2 py-1 rounded-md border border-border/50">
                          {p.code}
                        </span>
                        <span className="tabular-nums font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                          {p.uses.toLocaleString()} uses
                        </span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-3.5 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner cursor-pointer">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out hover:bg-primary/80"
                              style={{ width: `${(p.uses / maxPromo) * 100}%` }}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-xl border-border/50 bg-card/90 backdrop-blur-xl p-4 shadow-xl">
                          <div className="text-sm space-y-1.5">
                            <div className="font-black text-primary border-b border-border/50 pb-1.5 mb-1.5">
                              {p.code}
                            </div>
                            <div className="flex justify-between gap-4 font-medium">
                              <span className="text-muted-foreground">Redemptions:</span>{" "}
                              <span>{p.uses.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4 font-medium">
                              <span className="text-muted-foreground">Revenue:</span>{" "}
                              <span className="text-emerald-500 font-bold">
                                ${p.revenue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </Card>
        </div>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between border-b border-border/50 bg-accent/20 px-6 sm:px-8 py-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Recent Transactions
            </h2>
            <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm border border-border/50">
              Last 5 entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Txn</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Customer</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Package</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Amount</th>
                  <th className="px-6 py-4 font-bold border-b border-border/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {t.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{t.customer}</td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{t.package}</td>
                    <td className="px-6 py-4 font-bold tabular-nums">${t.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
                          t.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20",
                        )}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  up,
}: {
  icon: typeof BadgeDollarSign;
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <Card className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card/60 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm",
              up
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border border-rose-500/20",
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta}
          </span>
        </div>
        <div className="mt-5 text-3xl font-black tabular-nums tracking-tight text-foreground">
          {value}
        </div>
        <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
    </Card>
  );
}
