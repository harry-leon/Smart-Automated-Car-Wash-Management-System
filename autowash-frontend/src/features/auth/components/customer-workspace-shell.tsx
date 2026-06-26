"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { ArrowRightFromLine, Home, PackageSearch, CarFront, Gift, Bell, History, Sparkles } from "lucide-react";
import { getAuthRedirectPath } from "@/features/auth/lib/auth-session";
import { useCustomerLogout } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLanguageStore, translate } from "@/shared/store/language.store";
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
  const { language } = useLanguageStore();
  const [isMounted, setIsMounted] = useState(false);

  const t = (vi: string, en: string) => translate(language, vi, en);

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
    return <main style={{ padding: 24 }}>{t("Đang tải khu vực làm việc...", "Loading workspace...")}</main>;
  }

  if (!accessToken || !user) {
    return <main style={{ padding: 24 }}>{t("Đang chuyển đến trang đăng nhập...", "Redirecting to login...")}</main>;
  }

  if (user.role !== "CUSTOMER") {
    return <main style={{ padding: 24 }}>{t("Đang chuyển đến khu vực phù hợp...", "Redirecting to your workspace...")}</main>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] text-slate-900 dark:bg-none dark:bg-background dark:text-foreground">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-border dark:bg-card/85">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-primary dark:text-primary-foreground">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-foreground">
                {t("Khu vực khách hàng", "Customer Area")}
              </div>
              <div className="text-xs text-slate-500 dark:text-muted-foreground">
                {user.fullName} • {user.tier ?? t("THÀNH VIÊN", "MEMBER")}
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink href="/customer/home" icon={Home} label={t("Trang chủ", "Home")} />
            <NavLink href="/customer/bookings/new" icon={PackageSearch} label={t("Đặt lịch", "Book")} />
            <NavLink href="/customer/history" icon={History} label={t("Lịch sử", "History")} />
            <NavLink href="/customer/vehicles" icon={CarFront} label={t("Phương tiện", "Vehicles")} />
            <NavLink href="/customer/loyalty" icon={Gift} label={t("Tích điểm", "Loyalty")} />
            <NavLink href="/customer/promotions" icon={Sparkles} label={t("Khuyến mãi", "Promotions")} />
            <NavLink href="/customer/notifications" icon={Bell} label={t("Thông báo", "Notifications")} />
            <button
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              type="button"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800",
                "dark:border-border dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {logoutMutation.isPending
                ? t("Đang đăng xuất...", "Signing out...")
                : t("Đăng xuất", "Sign out")}
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
      className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700 hover:shadow-md dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-primary/50 dark:hover:text-primary"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
