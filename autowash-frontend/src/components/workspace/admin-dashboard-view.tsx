"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, CalendarDays, Droplets, RefreshCcw, TrendingUp, Users,
  Briefcase, Package, Ticket, BadgePercent 
} from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspacePage } from "@/components/workspace/workspace-page";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { getOperationsQueue } from "@/lib/operations-service";
import { useAdminPromotions } from "@/hooks/use-admin-promotions";
import { useAdminBookings } from "@/hooks/use-admin-bookings";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/types/api.types";

const QUICK_LINKS = [
  { href: "/admin/operations", label: "Operations", icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, color: "text-indigo-600 bg-indigo-50" },
  { href: "/admin/customers", label: "Customers", icon: Users, color: "text-emerald-600 bg-emerald-50" },
  { href: "/admin/staff", label: "Staff Team", icon: Briefcase, color: "text-amber-600 bg-amber-50" },
  { href: "/admin/packages", label: "Services", icon: Package, color: "text-rose-600 bg-rose-50" },
  { href: "/admin/promotions", label: "Promotions", icon: BadgePercent, color: "text-purple-600 bg-purple-50" },
  { href: "/admin/vouchers", label: "Vouchers", icon: Ticket, color: "text-pink-600 bg-pink-50" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, color: "text-teal-600 bg-teal-50" },
];

export function AdminDashboardView() {
  const queueQuery = useQuery({
    queryKey: ["admin-dashboard", "queue"],
    queryFn: getOperationsQueue,
    refetchInterval: 30_000,
  });
  const promotionsQuery = useAdminPromotions(1, 100);
  const activeBookingsQuery = useAdminBookings(1, 1, { status: "PENDING,CONFIRMED" });

  const summary = queueQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    checkedIn: 0,
    inProgress: 0,
    completed: 0,
  };

  const activeWashSessions = summary.pending + summary.checkedIn + summary.inProgress;
  const totalActiveBookings = activeBookingsQuery.data?.pagination.totalItems ?? 0;
  const totalPromotions = promotionsQuery.data?.pagination.totalItems ?? 0;

  const kpiCards = [
    {
      label: "Queue total",
      value: `${activeWashSessions}`,
      delta: "Live operations queue",
      icon: Droplets,
      tone: "text-orange-700 bg-orange-50",
    },
    {
      label: "Active bookings",
      value: `${totalActiveBookings}`,
      delta: "From all customer bookings",
      icon: CalendarDays,
      tone: "text-sky-700 bg-sky-50",
    },
    {
      label: "Promotions",
      value: `${totalPromotions}`,
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
