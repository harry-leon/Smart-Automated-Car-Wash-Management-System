"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  Gift,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  CarFront,
} from "lucide-react";
import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { WorkspacePage } from "@/components/workspace/workspace-page";
import { cn } from "@/lib/utils";

export default function CustomerHomePage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    { label: "Bookings", value: "12", icon: ClipboardList, color: "text-sky-700 bg-sky-50" },
    { label: "Loyalty points", value: "2,450", icon: Gift, color: "text-emerald-700 bg-emerald-50" },
    { label: "Notifications", value: "3", icon: Bell, color: "text-amber-700 bg-amber-50" },
    { label: "Wallet balance", value: "450k", icon: Wallet, color: "text-violet-700 bg-violet-50" },
  ];

  const shortcuts = [
    {
      href: "/customer/bookings/new",
      icon: ClipboardList,
      title: "New booking",
      text: "Create a booking with the current customer profile.",
    },
    {
      href: "/customer/vehicles",
      icon: CarFront,
      title: "Vehicles",
      text: "Review registered vehicles and vehicle details.",
    },
    {
      href: "/customer/loyalty",
      icon: Gift,
      title: "Loyalty",
      text: "Check points, tiers, and reward redemption options.",
    },
    {
      href: "/customer/notifications",
      icon: Bell,
      title: "Notifications",
      text: "Read booking updates and wash-status alerts.",
    },
  ];

  return (
    <WorkspacePage className="space-y-8">
      <div className="flex flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Customer workspace
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Welcome back{user?.fullName ? `, ${user.fullName}` : ""}.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Continue your wash flow, track your account, and jump into the most common
                  customer actions from one place.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {user?.fullName ?? "Customer"}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.tier ?? "MEMBER"} • {user?.phone}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-200/70 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardList className="h-4 w-4 text-sky-700" />
                Main flow shortcuts
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {shortcuts.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-all hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{item.text}</div>
                </Link>
              ))}
            </div>
          </Card>

          <Link
            href="/customer/profile"
            className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
            aria-label="Open profile page"
          >
            <div className="border-b border-slate-200/70 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-sky-700" />
                  Current account state
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition group-hover:bg-sky-100">
                  Open profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <InfoRow label="Status" value={user?.status ?? "ACTIVE"} />
              <InfoRow label="Role" value={user?.role ?? "CUSTOMER"} />
              <InfoRow label="Email" value={user?.email ?? "Not provided"} />
              <InfoRow label="Workspace" value="Customer" emphasized />
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-600">
                Live wash tracking and booking data are wired through the real backend contract.
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition group-hover:border-sky-200 group-hover:bg-sky-50">
                <span>View and edit your profile details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </section>
      </div>
    </WorkspacePage>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</div>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="text-sm text-slate-500">{label}</div>
      <div
        className={cn(
          "text-sm font-semibold text-slate-900",
          emphasized && "rounded-full bg-sky-50 px-3 py-1 text-sky-700",
        )}
      >
        {value}
      </div>
    </div>
  );
}
