"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle, BarChart3, CalendarDays, Droplets, Loader2,
  TrendingUp, Users, Package, Ticket, BadgePercent, DollarSign
} from "lucide-react";
import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { WorkspacePage } from "@/components/workspace/workspace-page";
import { getOperationsQueue } from "@/lib/operations-service";
import { useAdminDashboardMetrics } from "@/hooks/use-admin-dashboard-metrics";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/admin/operations", label: "Operations", icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, color: "text-indigo-600 bg-indigo-50" },
  { href: "/admin/accounts", label: "Accounts", icon: Users, color: "text-emerald-600 bg-emerald-50" },
  { href: "/admin/packages", label: "Services", icon: Package, color: "text-rose-600 bg-rose-50" },
  { href: "/admin/promotions", label: "Promotions", icon: BadgePercent, color: "text-purple-600 bg-purple-50" },
  { href: "/admin/vouchers", label: "Vouchers", icon: Ticket, color: "text-pink-600 bg-pink-50" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, color: "text-teal-600 bg-teal-50" },
];

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toLocaleString("vi-VN");
}

export function AdminDashboardView() {
  const queueQuery = useQuery({
    queryKey: ["admin-dashboard", "queue"],
    queryFn: getOperationsQueue,
    refetchInterval: 30_000,
  });
  const metricsQuery = useAdminDashboardMetrics();

  const summary = queueQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    checkedIn: 0,
    inProgress: 0,
    completed: 0,
  };

  const metrics = metricsQuery.data;

  const kpiCards = [
    {
      label: "Total bookings",
      value: `${metrics?.totalBookings ?? 0}`,
      delta: "All booking requests",
      icon: CalendarDays,
      tone: "text-sky-700 bg-sky-50",
    },
    {
      label: "Revenue (VND)",
      value: `${formatRevenue(metrics?.totalRevenue ?? 0)}`,
      delta: "Paid bookings",
      icon: DollarSign,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Customers",
      value: `${metrics?.totalCustomers ?? 0}`,
      delta: "Total customer accounts",
      icon: Users,
      tone: "text-violet-700 bg-violet-50",
    },
    {
      label: "Active promotions",
      value: `${metrics?.activePromotions ?? 0}`,
      delta: "Currently running campaigns",
      icon: BadgePercent,
      tone: "text-orange-700 bg-orange-50",
    },
  ];

  const liveCards = [
    {
      label: "Current queue",
      value: `${summary.pending + summary.checkedIn + summary.inProgress}`,
      delta: "Live sessions in progress",
      icon: Droplets,
      tone: "text-blue-700 bg-blue-50",
    },
    {
      label: "Completed today",
      value: `${summary.completed}`,
      delta: "Live wash sessions",
      icon: TrendingUp,
      tone: "text-teal-700 bg-teal-50",
    },
  ];

  return (
    <WorkspacePage className="space-y-8">
      {/* API metrics */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Overview metrics
          </h2>
          {metricsQuery.isError && (
            <span className="flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Failed to load metrics
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} isLoading={metricsQuery.isLoading} />
          ))}
        </div>
      </section>

      {/* Live operations */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Live operations
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {liveCards.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} isLoading={queueQuery.isLoading} />
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <Card className="border-border/70 bg-card/95 p-8 shadow-sm">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold">Quick actions</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Jump into the most common admin workflows without changing the existing routes.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", link.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900">{link.label}</span>
                </Link>
              );
            })}
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
  isLoading,
}: {
  label: string;
  value: string;
  delta: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="border-border/70 bg-card/95 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          {isLoading ? (
            <div className="mt-2 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          )}
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{delta}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
