"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightFromLine,
  ChevronDown,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UserCog,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useCustomerLogout } from "@/features/auth/hooks/use-auth";
import { getAuthRedirectPath } from "@/features/auth/lib/auth-session";
import { cn } from "@/shared/lib/utils";
import { clearAuthSession, useAuthStore } from "@/features/auth/store/auth.store";
import type { UserRole } from "@/features/auth/auth.types";
import { getWorkspaceHeaderMeta } from "@/shared/components/workspace/workspace-header-meta";
import {
  mobileNavForRole,
  navForRole,
  SHELL_EXCLUDED_PATHS,
  WORKSPACE_THEMES,
  type WorkspaceNavItem,
} from "@/shared/components/workspace/workspace-nav";
import { StaffNotificationListener } from "@/features/staff/operations/components/staff-notification-listener";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

type RoleWorkspaceShellProps = {
  requiredRole: UserRole;
  children: ReactNode;
};

export function RoleWorkspaceShell({ requiredRole, children }: RoleWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useCustomerLogout();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isExcluded = SHELL_EXCLUDED_PATHS.includes(pathname);
  const theme = WORKSPACE_THEMES[requiredRole];
  const navItems = navForRole(requiredRole);
  const mobileItems = mobileNavForRole(requiredRole);
  const headerMeta = getWorkspaceHeaderMeta(pathname);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMounted || isExcluded) {
      return;
    }

    if (!accessToken || !user) {
      router.replace(requiredRole === "ADMIN" ? "/admin/login" : "/login");
      return;
    }

    if (user.role !== requiredRole) {
      router.replace(getAuthRedirectPath(user.role));
    }
  }, [accessToken, isExcluded, isMounted, requiredRole, router, user]);

  if (isExcluded) {
    return <>{children}</>;
  }

  if (!isMounted) {
    return <WorkspaceGate message="Ðang t?i khu v?c làm vi?c..." />;
  }

  if (!accessToken || !user) {
    return <WorkspaceGate message="Ðang chuy?n d?n trang dang nh?p..." />;
  }

  if (user.role !== requiredRole) {
    return <WorkspaceGate message="Ðang chuy?n d?n khu v?c phù h?p..." />;
  }

  const handleLogout = () => {
    if (requiredRole === "CUSTOMER") {
      logoutMutation.mutate();
      return;
    }

    clearAuthSession();
    router.push(requiredRole === "ADMIN" ? "/admin/login" : "/login");
  };

  const profileHref =
    requiredRole === "CUSTOMER"
      ? "/customer/profile"
      : requiredRole === "STAFF"
        ? "/staff/profile"
        : "/admin/dashboard";
  const quickActions = getProfileQuickActions(requiredRole);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,#fff_55%,hsl(var(--muted))_100%)]" />

      <aside
        className={cn(
          "sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-border/70 bg-card/85 backdrop-blur-xl transition-all duration-300 lg:flex",
          sidebarCollapsed ? "w-[5.25rem]" : "w-72",
        )}
      >
        <SidebarBrand
          collapsed={sidebarCollapsed}
          theme={theme}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />

        <nav className={cn("min-h-0 flex-1 overflow-y-auto", sidebarCollapsed ? "px-2 py-4" : "px-3 py-4")}>
          <ul className={cn(sidebarCollapsed ? "space-y-3" : "space-y-1")}>
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={sidebarCollapsed}
                activeClassName={theme.activeNav}
              />
            ))}
          </ul>
        </nav>

        <div className="mt-auto space-y-3 border-t border-border/70 p-4">
          {!sidebarCollapsed ? (
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", theme.accent)}>
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">H? tr?</div>
                  <div className="mt-0.5 text-sm font-extrabold tracking-tight">1900 1234</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">8:00 - 20:00 h?ng ngày</div>
                </div>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm font-semibold transition hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed ? (
              <span>{logoutMutation.isPending ? "Ðang dang xu?t..." : "Ðang xu?t"}</span>
            ) : null}
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="M? menu di?u hu?ng"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p
                  className={cn(
                    "mb-1 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    theme.accentSoft,
                  )}
                >
                  {theme.label}
                </p>
                <h1 className="truncate text-xl font-bold tracking-tight lg:text-2xl">
                  {headerMeta.title}
                </h1>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {headerMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="group flex max-w-[12rem] items-center gap-2 rounded-xl border border-border/70 bg-card/90 px-2 py-1.5 text-left transition hover:border-primary/30 hover:bg-card sm:max-w-none sm:px-3"
                    aria-label="M? menu h? so"
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border", theme.accentSoft)}>
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div className="hidden min-w-0 sm:block">
                      <div className="truncate text-sm font-bold">{user.fullName}</div>
                      <div className="truncate text-[11px] font-semibold text-muted-foreground">
                        {requiredRole === "CUSTOMER" ? (user.tier ?? "MEMBER") : user.role}
                      </div>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground transition group-data-[state=open]:rotate-180 sm:block" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={10}
                  className="w-72 rounded-2xl border-border/70 bg-white/95 p-2 text-slate-950 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl"
                >
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border", theme.accentSoft)}>
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-950">{user.fullName}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          {requiredRole === "CUSTOMER" ? (user.tier ?? "MEMBER") : user.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-slate-100" />

                  <Link
                    href={profileHref}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
                  >
                      <UserCog className="h-4 w-4 text-primary" />
                      H? so cá nhân
                  </Link>

                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        {action.label}
                      </Link>
                    );
                  })}

                  <div className="my-1 h-px bg-slate-100" />

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-slate-50"
                    onClick={() => router.refresh()}
                  >
                    <RefreshCw className="h-4 w-4 text-slate-500" />
                    Làm m?i d? li?u
                  </button>

                  <button
                    type="button"
                    disabled={logoutMutation.isPending}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? "Ðang dang xu?t..." : "Ðang xu?t"}
                  </button>
                </PopoverContent>
              </Popover>

              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 px-3 text-sm font-semibold transition hover:bg-accent lg:hidden"
                aria-label="Ðang xu?t"
              >
                <ArrowRightFromLine className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
        {requiredRole === "STAFF" ? <StaffNotificationListener /> : null}

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 py-2 backdrop-blur-xl lg:hidden">
          <ul className="grid grid-cols-4 gap-1">
            {mobileItems.map((item) => {
              const active = isNavActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold",
                      active ? theme.mobileActive : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Ðóng menu di?u hu?ng"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-card shadow-2xl">
            <SidebarBrand
              collapsed={false}
              theme={theme}
              onToggle={() => setMobileMenuOpen(false)}
              closeLabel="Ðóng"
            />
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <SidebarNavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={false}
                    activeClassName={theme.activeNav}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceGate({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground shadow-sm">
        {message}
      </p>
    </main>
  );
}

function getProfileQuickActions(role: UserRole) {
  if (role === "STAFF") {
    return [
      { href: "/staff/dashboard", label: "T?ng quan ca làm", icon: LayoutDashboard },
      { href: "/staff/operations", label: "B?ng v?n hành", icon: ClipboardList },
      { href: "/staff/check-in", label: "Duy?t check-in", icon: Wrench },
      { href: "/staff/sessions/history", label: "L?ch s? phiên r?a", icon: History },
    ];
  }

  if (role === "ADMIN") {
    return [
      { href: "/admin/dashboard", label: "T?ng quan qu?n tr?", icon: LayoutDashboard },
      { href: "/admin/accounts", label: "Qu?n lý tài kho?n", icon: UserCog },
      { href: "/admin/settings", label: "Cài d?t h? th?ng", icon: Settings2 },
    ];
  }

  return [
    { href: "/customer/home", label: "Trang khách hàng", icon: LayoutDashboard },
    { href: "/customer/bookings", label: "L?ch d?t c?a tôi", icon: ClipboardList },
    { href: "/customer/settings", label: "Cài d?t tài kho?n", icon: Settings2 },
  ];
}

function SidebarBrand({
  collapsed,
  theme,
  onToggle,
  closeLabel,
}: {
  collapsed: boolean;
  theme: (typeof WORKSPACE_THEMES)[UserRole];
  onToggle: () => void;
  closeLabel?: string;
}) {
  if (collapsed) {
    return (
      <div className="border-b border-border/70 px-2.5 py-4">
        <div className="mx-auto flex h-11 w-full items-center justify-center">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-white text-primary shadow-[0_12px_30px_rgba(124,58,237,0.16)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_16px_36px_rgba(124,58,237,0.22)]"
            aria-label="M? r?ng thanh bên"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/70 px-4 py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black tracking-tighter", theme.accent)}>
            AC
          </div>
          {!collapsed ? (
            <div className="min-w-0 animate-in fade-in">
              <div className="truncate font-bold tracking-tight">AURA CAR CARE</div>
              <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {theme.description}
              </div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition hover:bg-accent"
          aria-label={closeLabel ?? (collapsed ? "M? r?ng thanh bên" : "Thu g?n thanh bên")}
        >
          {closeLabel ? (
            <X className="h-4 w-4" />
          ) : collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function SidebarNavLink({
  item,
  pathname,
  collapsed,
  activeClassName,
  onNavigate,
}: {
  item: WorkspaceNavItem;
  pathname: string;
  collapsed: boolean;
  activeClassName: string;
  onNavigate?: () => void;
}) {
  const active = isNavActive(pathname, item);
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group flex items-center rounded-xl text-sm font-medium transition-all",
          collapsed ? "mx-auto h-12 w-12 justify-center rounded-2xl" : "gap-3 px-3 py-2.5",
          active ? activeClassName : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed ? <span>{item.label}</span> : null}
      </Link>
    </li>
  );
}

function isNavActive(pathname: string, item: WorkspaceNavItem) {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

