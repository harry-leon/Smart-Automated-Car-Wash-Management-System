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
  CarFront,
} from "lucide-react";
import type { ComponentType } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/shared/lib/utils";
import { formatBookingCurrency } from "@/features/customer/bookings/lib/booking-format";
import { useCustomerProfile } from "@/features/customer/profile/hooks/use-customer-profile";
import { useActiveCustomerCombos, useBookingCombos, useCustomerBookings } from "@/features/customer/bookings/hooks/use-bookings";
import { useCustomerVehicles } from "@/features/customer/vehicles/hooks/use-customer-vehicles";
import type { BookingCombo, CustomerCombo } from "@/features/customer/bookings/booking.types";

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
      label: "Đơn đặt lịch",
      value: bookingsQuery.isLoading ? "..." : String(bookingsQuery.data?.pagination.total ?? 0),
      icon: ClipboardList,
      color: "text-cyan-700 bg-cyan-50/60 border border-cyan-100",
    },
    {
      label: "Điểm tích lũy",
      value: profileQuery.isLoading ? "..." : (profileQuery.data?.loyaltyBalance !== undefined && profileQuery.data?.loyaltyBalance !== null ? profileQuery.data.loyaltyBalance.toLocaleString("vi-VN") : "0"),
      icon: Gift,
      color: "text-lime-700 bg-lime-50/60 border border-lime-100",
    },
    {
      label: "Thông báo",
      value: "3", // Mocked as there is no backend notification center yet
      icon: Bell,
      color: "text-slate-700 bg-slate-100/80 border border-slate-200/50",
    },
    {
      label: "Phương tiện",
      value: vehiclesQuery.isLoading ? "..." : String(vehiclesQuery.data?.pagination.total ?? 0),
      icon: CarFront,
      color: "text-cyan-800 bg-cyan-50/40 border border-cyan-100/60",
    },
  ];

  const shortcuts = [
    {
      href: "/customer/bookings/new",
      icon: ClipboardList,
      title: "Đặt lịch rửa xe",
      text: "Tạo đơn đặt lịch rửa xe trực tuyến nhanh chóng.",
    },
    {
      href: "/customer/vehicles",
      icon: CarFront,
      title: "Quản lý xe",
      text: "Quản lý danh sách xe và thêm phương tiện mới.",
    },
    {
      href: "/customer/loyalty",
      icon: Gift,
      title: "Ưu đãi thành viên",
      text: "Theo dõi hạng thành viên, tích lũy điểm và đổi quà.",
    },
    {
      href: "/customer/notifications",
      icon: Bell,
      title: "Hộp thư thông báo",
      text: "Xem các cập nhật trạng thái rửa xe và lịch hẹn.",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(132,204,22,0.04),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.04),transparent_35%),linear-gradient(180deg,#fafbfc_0%,#ffffff_48%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-lime-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Khu vực khách hàng
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Chào mừng trở lại{user?.fullName ? `, ${user.fullName}` : ""}.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Theo dõi tiến trình rửa xe của bạn, cập nhật thông tin tài khoản và thực hiện các dịch vụ rửa xe thông dụng nhất ngay tại đây.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 shadow-sm transition-all hover:border-slate-350">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-cyan-400 border border-slate-800 shadow-md">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {user?.fullName ?? "Khách hàng"}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {user?.tier ?? "MEMBER"} • {user?.phone}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="bg-[linear-gradient(135deg,rgba(6,182,212,0.08),rgba(132,204,22,0.04),rgba(255,255,255,0.95))] px-6 py-5 sm:px-8 border-b border-slate-200/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700">
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
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold text-cyan-700 shadow-sm">
                {activeComboSummaries.length > 0 ? `${activeComboSummaries.length} gói đang hoạt động` : "Chưa có combo"}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeCombosQuery.isLoading || combosQuery.isLoading ? (
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-4 h-8 w-56 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                  <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-4 h-28 animate-pulse rounded-xl bg-slate-200" />
                  <div className="mt-3 h-28 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
            ) : primaryActiveCombo ? (
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-[linear-gradient(180deg,rgba(236,254,255,0.6)_0%,rgba(255,255,255,1)_50%,rgba(248,250,252,1)_100%)] p-6 shadow-[0_10px_35px_rgba(6,182,212,0.04)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 border border-slate-800 shadow-sm">
                        <Badge variant="outline" className="border-cyan-400/40 bg-cyan-950/40 text-cyan-400 rounded-full text-[9px] py-0 px-2 font-black">
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
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.02] active:scale-95"
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
                          className="inline-flex items-center rounded-full border border-slate-100 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-450">
                        Combo đang dùng
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {activeComboSummaries.length} gói đang hoạt động
                      </div>
                    </div>
                    <div className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                      Live
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeComboSummaries.map((item) => (
                      <div
                        key={item.customerComboId}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {item.combo?.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500 font-semibold">
                              Còn {item.remainingUsages} lượt sử dụng
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
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
                <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,1)_100%)] p-6">
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
                    <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-900 transition-all duration-200 active:scale-95 shadow-sm">
                      <Link href="/customer/combos">Xem combo phù hợp</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full transition-all duration-200 active:scale-95">
                      <Link href="/customer/bookings/new">Đặt lịch rửa xe</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    Lợi ích khi mua combo
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Theo dõi lượt dùng và hạn sử dụng ngay tại trang chủ",
                      "Xem nhanh các quyền lợi chính của gói combo",
                      "Đặt lịch nhanh chóng sử dụng số lượt trong gói",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm">
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
          <Card className="overflow-hidden border-slate-200/60 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.03)] backdrop-blur-md rounded-3xl transition-all duration-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-200/50 bg-slate-50/40 px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardList className="h-4 w-4 text-cyan-600" />
                Phím tắt nhanh
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {shortcuts.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-white hover:shadow-md active:scale-98"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50/80 text-cyan-700 border border-cyan-100 transition-colors group-hover:bg-slate-950 group-hover:text-cyan-400 group-hover:border-slate-800">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500 font-semibold">{item.text}</div>
                </Link>
              ))}
            </div>
          </Card>

          <Link
            href="/customer/profile"
            className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.06)] active:scale-99"
            aria-label="Xem trang hồ sơ"
          >
            <div className="border-b border-slate-200/50 bg-slate-50/40 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  Thông tin tài khoản hiện tại
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50/60 px-3 py-1 text-xs font-bold text-cyan-755 transition group-hover:bg-cyan-100">
                  Xem hồ sơ
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <InfoRow label="Trạng thái" value={user?.status ?? "ACTIVE"} />
              <InfoRow label="Vai trò" value={user?.role ?? "CUSTOMER"} />
              <InfoRow label="Email" value={user?.email ?? "Chưa cung cấp"} />
              <InfoRow label="Khu vực hoạt động" value="Khách hàng" emphasized />
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/30 p-4 text-sm font-semibold text-slate-650">
                Lịch trình và trạng thái rửa xe của bạn được kết nối trực tiếp với hệ thống tự động Aura.
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition group-hover:border-cyan-200 group-hover:bg-cyan-50">
                <span>Xem chi tiết hồ sơ cá nhân</span>
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
    <Card className="border-slate-200/50 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.02)] rounded-3xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.04)] hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</div>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", color)}>
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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/50 bg-slate-50/50 px-4 py-3 hover:border-slate-300 transition-all duration-200">
      <div className="text-sm text-slate-500 font-semibold">{label}</div>
      <div
        className={cn(
          "text-sm font-bold text-slate-900",
          emphasized && "rounded-full border border-cyan-200 bg-cyan-50/60 px-3 py-1 text-cyan-700",
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
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm hover:border-slate-350 transition-all duration-200">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-xl font-black tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs font-semibold text-muted-foreground">{note}</div>
    </div>
  );
}
