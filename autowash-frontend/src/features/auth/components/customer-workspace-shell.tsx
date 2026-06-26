"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { ArrowRightFromLine, Home, PackageSearch, CarFront, Gift, Bell, History, Sparkles } from "lucide-react";
import { getAuthRedirectPath } from "@/features/auth/lib/auth-session";
import { useCustomerLogout } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/shared/lib/utils";

export function CustomerWorkspaceShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const logoutMutation = useCustomerLogout();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "CUSTOMER") {
      router.replace(getAuthRedirectPath(user.role));
    }
  }, [accessToken, isMounted, router, user]);

  if (!isMounted) {
    return <main style={{ padding: 24 }}>Đang tải khu vực làm việc...</main>;
  }

  if (!accessToken || !user) {
    return <main style={{ padding: 24 }}>Đang chuyển đến trang đăng nhập...</main>;
  }

  if (user.role !== "CUSTOMER") {
    return <main style={{ padding: 24 }}>Đang chuyển đến khu vực phù hợp...</main>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Khu vực khách hàng</div>
              <div className="text-xs text-slate-500">
                {user.fullName} • {user.tier ?? "MEMBER"}
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink href="/customer/home" icon={Home} label="Trang chủ" />
            <NavLink href="/customer/bookings/new" icon={PackageSearch} label="Đặt lịch" />
            <NavLink href="/customer/history" icon={History} label="Lịch sử" />
            <NavLink href="/customer/vehicles" icon={CarFront} label="Phương tiện" />
            <NavLink href="/customer/loyalty" icon={Gift} label="Tích điểm" />
            <NavLink href="/customer/promotions" icon={Sparkles} label="Khuyến mãi" />
            <NavLink href="/customer/notifications" icon={Bell} label="Thông báo" />
            <button
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              type="button"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
              <ArrowRightFromLine className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700 hover:shadow-md"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
