"use client";

import Link from "next/link";
import { useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { formatBookingCurrency } from "@/lib/booking-format";
import { useCustomerProfile } from "@/hooks/use-customer-profile";
import { useActiveCustomerCombos, useBookingCombos, useCustomerBookings } from "@/hooks/use-bookings";
import { useCustomerVehicles } from "@/hooks/use-customer-vehicles";
import type { BookingCombo, CustomerCombo } from "@/types/booking.types";

type ActiveCustomerComboSummary = CustomerCombo & {
  combo: BookingCombo;
};

export default function CustomerHomePage() {
  const user = useAuthStore((state) => state.user);

  const profileQuery = useCustomerProfile();
  const bookingsQuery = useCustomerBookings();
  const vehiclesQuery = useCustomerVehicles();
  const combosQuery = useBookingCombos();
  const activeCombosQuery = useActiveCustomerCombos();
  const sortedCombos = useMemo(() => {
    return [...(combosQuery.data ?? [])].sort((left, right) => {
      const leftSavings = (left.upgradePriceFrom || left.basePrice) - left.basePrice;
      const rightSavings = (right.upgradePriceFrom || right.basePrice) - right.basePrice;
      return rightSavings - leftSavings;
    });
  }, [combosQuery.data]);
  const activeComboSummaries = useMemo(() => {
    const comboMap = new Map(sortedCombos.map((combo) => [combo.comboId, combo] as const));

    return (activeCombosQuery.data ?? [])
      .filter((item) => Number(item.remainingUsages) > 0)
      .map((item) => {
        const combo = comboMap.get(item.comboId);
        return {
          ...item,
          combo,
        };
      })
      .filter((item): item is ActiveCustomerComboSummary => Boolean(item.combo));
  }, [activeCombosQuery.data, sortedCombos]);
  const primaryActiveCombo = activeComboSummaries[0] ?? null;

  const stats = [
    {
      label: "Bookings",
      value: bookingsQuery.isLoading ? "..." : String(bookingsQuery.data?.pagination.total ?? 0),
      icon: ClipboardList,
      color: "text-sky-700 bg-sky-50",
    },
    {
      label: "Loyalty points",
      value: profileQuery.isLoading ? "..." : (profileQuery.data?.loyaltyBalance !== undefined && profileQuery.data?.loyaltyBalance !== null ? profileQuery.data.loyaltyBalance.toLocaleString("vi-VN") : "0"),
      icon: Gift,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Notifications",
      value: "3", // Mocked as there is no backend notification center yet
      icon: Bell,
      color: "text-amber-700 bg-amber-50",
    },
    {
      label: "Vehicles",
      value: vehiclesQuery.isLoading ? "..." : String(vehiclesQuery.data?.pagination.total ?? 0),
      icon: CarFront,
      color: "text-violet-700 bg-violet-50",
    },
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
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Khu vực khách hàng
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

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(37,99,235,0.08),rgba(255,255,255,0.94))] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Combo đăng ký
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  Gói combo của bạn
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Xem nhanh gói combo đang còn hiệu lực, số lượt còn lại và các quyền lợi chính ngay tại trang chủ.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700">
                {activeComboSummaries.length > 0 ? `${activeComboSummaries.length} gói đang hoạt động` : "Chưa có combo"}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeCombosQuery.isLoading || combosQuery.isLoading ? (
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-4 h-8 w-56 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                  <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-4 h-28 animate-pulse rounded-[1.25rem] bg-slate-200" />
                  <div className="mt-3 h-28 animate-pulse rounded-[1.25rem] bg-slate-200" />
                </div>
              </div>
            ) : primaryActiveCombo ? (
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="overflow-hidden rounded-[1.75rem] border border-sky-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98)_0%,rgba(255,255,255,1)_58%,rgba(248,250,252,0.99)_100%)] p-6 shadow-[0_18px_45px_rgba(14,165,233,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-sm shadow-sky-600/20">
                        <Badge variant="outline" className="border-white/40 bg-white/20 text-white">
                          Active
                        </Badge>
                        Combo ưu tiên
                      </div>
                      <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                        {primaryActiveCombo.combo.name}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        {primaryActiveCombo.combo.description}
                      </p>
                    </div>

                    <Link
                      href={`/customer/combos/${primaryActiveCombo.comboId}/checkout`}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
                    >
                      Xem chi tiết
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <InfoPill
                      label="Còn lượt"
                      value={`${primaryActiveCombo.remainingUsages}/${primaryActiveCombo.combo.maxServices}`}
                      note="Lượt dùng còn lại"
                    />
                    <InfoPill
                      label="Hết hạn"
                      value={new Date(primaryActiveCombo.expiresAt).toLocaleDateString("vi-VN")}
                      note="Ngày hết hạn"
                    />
                    <InfoPill
                      label="Tiết kiệm"
                      value={formatBookingCurrency(
                        Math.max(
                          0,
                          (primaryActiveCombo.combo.upgradePriceFrom || primaryActiveCombo.combo.basePrice || 0) -
                            (primaryActiveCombo.combo.basePrice || 0),
                        ),
                      )}
                      note="So với giá gốc"
                    />
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                      Quyền lợi nổi bật
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {primaryActiveCombo.combo.benefits.slice(0, 5).map((benefit) => (
                        <span
                          key={benefit}
                          className="inline-flex items-center rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                        Combo đang dùng
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {activeComboSummaries.length} gói đang hoạt động
                      </div>
                    </div>
                    <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      Live
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeComboSummaries.map((item) => (
                      <div
                        key={item.customerComboId}
                        className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {item.combo?.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Còn {item.remainingUsages} lượt sử dụng
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                            Active
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(item.combo?.benefits ?? []).slice(0, 3).map((benefit) => (
                            <span
                              key={benefit}
                              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,1)_100%)] p-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Chưa có combo
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    Bạn chưa có gói combo đang hoạt động
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Khi mua combo, thông tin sử dụng sẽ tự động hiện ở đây để bạn theo dõi lượt còn lại, ngày hết hạn và quyền lợi đang có.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
                      <Link href="/customer/combos">Xem combo phù hợp</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/customer/bookings/new">Đặt lịch rửa xe</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    Lợi ích khi mua combo
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Theo dõi lượt dùng và hạn sử dụng ngay tại home",
                      "Xem nhanh các quyền lợi chính của gói combo",
                      "Đi thẳng đến trang thanh toán combo riêng",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white bg-white p-4 text-sm text-slate-700 shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
    </div>
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

function InfoPill({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-xl font-black tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{note}</div>
    </div>
  );
}
