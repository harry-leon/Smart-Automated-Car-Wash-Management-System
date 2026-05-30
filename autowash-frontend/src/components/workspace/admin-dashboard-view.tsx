"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarDays, Droplets, RefreshCcw, TrendingUp, Users } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspacePage } from "@/components/workspace/workspace-page";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { getOperationsQueue } from "@/lib/operations-service";
import { useAdminPromotions } from "@/hooks/use-admin-promotions";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/types/api.types";

const QUICK_LINKS = [
  { href: "/admin/promotions", label: "Manage promotions" },
  { href: "/admin/operations", label: "Operations health" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/customers", label: "Customer accounts" },
];

export function AdminDashboardView() {
  const queueQuery = useQuery({
    queryKey: ["admin-dashboard", "queue"],
    queryFn: getOperationsQueue,
    refetchInterval: 30_000,
  });
  const promotionsQuery = useAdminPromotions(1, 100);

  const summary = queueQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    checkedIn: 0,
    inProgress: 0,
    completed: 0,
  };

  const kpiCards = [
    {
      label: "Queue total",
      value: `${summary.total}`,
      delta: "Live operations queue",
      icon: Droplets,
      tone: "text-orange-700 bg-orange-50",
    },
    {
      label: "Active bookings",
      value: `${summary.pending + summary.checkedIn + summary.inProgress}`,
      delta: "From operations queue",
      icon: CalendarDays,
      tone: "text-sky-700 bg-sky-50",
    },
    {
      label: "Promotions",
      value: `${promotionsQuery.data?.items.length ?? 0}`,
      delta: "Admin promotion records",
      icon: Users,
      tone: "text-violet-700 bg-violet-50",
    },
    {
      label: "Completed sessions",
      value: `${summary.completed}`,
      delta: "Live wash sessions",
      icon: TrendingUp,
      tone: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <WorkspacePage className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <BarChart3 className="h-4 w-4 text-orange-700" />
              Live queue snapshot
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/operations">Open operations</Link>
            </Button>
          </div>
          <div className="divide-y divide-border/60">
            {queueQuery.isError ? (
              <div className="px-6 py-4 text-sm text-rose-700">
                {getDisplayErrorMessage(queueQuery.error as unknown as ApiErrorResponse)}
              </div>
            ) : queueQuery.isPending ? (
              <div className="px-6 py-8">
                <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
              </div>
            ) : queueQuery.data?.columns?.length ? (
              queueQuery.data.columns.flatMap((column) =>
                column.sessions.slice(0, 3).map((session) => (
                  <div key={session.sessionId} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div>
                      <div className="text-sm font-bold">{session.customerName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {session.bookingId} / {session.vehiclePlate} / {session.bookingDate} {session.bookingTime}
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                      {session.status}
                    </span>
                  </div>
                )),
              )
            ) : (
              <div className="px-6 py-8 text-sm text-muted-foreground">No live sessions found.</div>
            )}
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
            Dashboard metrics are composed from live queue and promotion data because a dedicated
            admin metrics endpoint is not available yet.
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Promotions loaded: {promotionsQuery.data?.items.length ?? 0}</span>
            <Button variant="ghost" size="sm" onClick={() => promotionsQuery.refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh promotions
            </Button>
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
