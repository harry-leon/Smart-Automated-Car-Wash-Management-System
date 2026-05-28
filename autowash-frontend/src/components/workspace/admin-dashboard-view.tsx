import Link from "next/link";
import { BarChart3, CalendarDays, Droplets, TrendingUp, Users } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspacePage } from "@/components/workspace/workspace-page";
import { cn } from "@/lib/utils";

const KPI_CARDS = [
  {
    label: "Revenue today",
    value: "18.4M",
    delta: "+12%",
    icon: TrendingUp,
    tone: "text-orange-700 bg-orange-50",
  },
  {
    label: "Active bookings",
    value: "24",
    delta: "+3",
    icon: CalendarDays,
    tone: "text-sky-700 bg-sky-50",
  },
  {
    label: "Customers",
    value: "1,284",
    delta: "+18",
    icon: Users,
    tone: "text-violet-700 bg-violet-50",
  },
  {
    label: "Wash sessions",
    value: "16",
    delta: "Live",
    icon: Droplets,
    tone: "text-emerald-700 bg-emerald-50",
  },
];

const QUICK_LINKS = [
  { href: "/admin/bookings", label: "Manage bookings" },
  { href: "/admin/customers", label: "Customer accounts" },
  { href: "/admin/operations", label: "Operations health" },
  { href: "/admin/reports", label: "Open reports" },
];

const RECENT_BOOKINGS = [
  { id: "BK-9001", customer: "Nguyen Van A", status: "IN_PROGRESS", amount: "450,000" },
  { id: "BK-9002", customer: "Tran Thi B", status: "CONFIRMED", amount: "320,000" },
  { id: "BK-9003", customer: "Le Van C", status: "COMPLETED", amount: "680,000" },
];

const STATUS_TONE: Record<string, string> = {
  CONFIRMED: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  IN_PROGRESS: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

export function AdminDashboardView() {
  return (
    <WorkspacePage className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <BarChart3 className="h-4 w-4 text-orange-700" />
              Recent bookings
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">View all</Link>
            </Button>
          </div>
          <div className="divide-y divide-border/60">
            {RECENT_BOOKINGS.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <div className="text-sm font-bold">{booking.customer}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {booking.id} / {booking.amount} VND
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    STATUS_TONE[booking.status],
                  )}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 bg-card/95 p-6 shadow-sm">
          <h2 className="text-sm font-bold">Quick actions</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Jump into the most common admin workflows without changing the existing routes.
          </p>
          <div className="mt-5 grid gap-2">
            {QUICK_LINKS.map((link) => (
              <Button key={link.href} variant="outline" className="justify-start" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-orange-200/80 bg-orange-50/70 p-4 text-sm text-orange-950">
            KPI values stay presentation-only until GET /admin/dashboard/metrics is wired.
          </div>
        </Card>
      </section>
    </WorkspacePage>
  );
}

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Card className="border-border/70 bg-card/95 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{delta}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
