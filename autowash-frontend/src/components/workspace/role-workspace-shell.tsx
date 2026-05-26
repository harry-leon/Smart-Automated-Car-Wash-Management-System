"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightFromLine,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getAuthRedirectPath } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { useCustomerLogout } from "@/hooks/use-auth";
import { clearAuthSession, useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth.types";
import { getWorkspaceHeaderMeta } from "@/components/workspace/workspace-header-meta";
import {
  mobileNavForRole,
  navForRole,
  SHELL_EXCLUDED_PATHS,
  WORKSPACE_THEMES,
  type WorkspaceNavItem,
} from "@/components/workspace/workspace-nav";

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

  const theme = WORKSPACE_THEMES[requiredRole];
  const navItems = navForRole(requiredRole);
  const mobileItems = mobileNavForRole(requiredRole);
  const headerMeta = getWorkspaceHeaderMeta(pathname);
  const isExcluded = SHELL_EXCLUDED_PATHS.some((path) => pathname === path);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMounted || isExcluded) return;

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
    return <WorkspaceGate message="Loading workspace..." />;
  }

  if (!accessToken || !user) {
    return <WorkspaceGate message="Redirecting to sign in..." />;
  }

  if (user.role !== requiredRole) {
    return <WorkspaceGate message="Redirecting to your workspace..." />;
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
    requiredRole === "CUSTOMER" ? "/customer/profile" : `/${requiredRole.toLowerCase()}/dashboard`;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[50vw] w-[50vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[50vw] w-[50vw] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <aside
        className={cn(
          "relative z-20 hidden shrink-0 flex-col border-r border-border/60 bg-card/70 backdrop-blur-xl transition-all duration-300 lg:flex",
          sidebarCollapsed ? "w-[5.25rem]" : "w-72",
        )}
      >
        <SidebarBrand
          collapsed={sidebarCollapsed}
          theme={theme}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />
        <nav className={cn("flex-1 overflow-y-auto py-4", sidebarCollapsed ? "px-2" : "px-3")}>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={sidebarCollapsed}
                activeClassName={theme.accentClass}
              />
            ))}
          </ul>
        </nav>
        <div className="mt-auto space-y-3 border-t border-border/60 p-4">
          {!sidebarCollapsed ? (
            <div className="rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    theme.accentClass,
                  )}
                >
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Customer Support</div>
                  <div className="mt-0.5 text-sm font-extrabold tracking-tight">1900 1234</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">8:00 - 20:00 daily</div>
                </div>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm font-semibold transition hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed ? (
              <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
            ) : null}
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p
                  className={cn(
                    "mb-1 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    theme.accentMutedClass,
                  )}
                >
                  {theme.workspaceLabel}
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
              <Link
                href={profileHref}
                className="group flex max-w-[12rem] items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-2 py-1.5 transition hover:border-primary/30 sm:max-w-none sm:px-3"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    theme.accentMutedClass,
                  )}
                >
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="hidden min-w-0 sm:block">
                  <div className="truncate text-sm font-bold">{user.fullName}</div>
                  <div className="truncate text-[11px] font-semibold text-muted-foreground">
                    {requiredRole === "CUSTOMER" ? (user.tier ?? "MEMBER") : user.role}
                  </div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </Link>
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/60 px-3 text-sm font-semibold transition hover:bg-accent lg:hidden"
              >
                <ArrowRightFromLine className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-2 py-2 backdrop-blur-xl lg:hidden">
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
                      active ? theme.mobileNavActiveClass : "text-muted-foreground",
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
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-card shadow-2xl">
            <SidebarBrand
              collapsed={false}
              theme={theme}
              onToggle={() => setMobileMenuOpen(false)}
              closeLabel="Close"
            />
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <SidebarNavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={false}
                    activeClassName={theme.accentClass}
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
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </main>
  );
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
  return (
    <div className="border-b border-border/60 px-4 py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black tracking-tighter text-white shadow-sm ring-1 ring-border/60">
            AC
          </div>
          {!collapsed ? (
            <div className="min-w-0 animate-in fade-in">
              <div className="truncate font-bold tracking-tight">AURA CAR CARE</div>
              <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {theme.workspaceLabelVi}
              </div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-accent"
          aria-label={closeLabel ?? (collapsed ? "Expand sidebar" : "Collapse sidebar")}
        >
          {closeLabel ? (
            <PanelLeftClose className="h-4 w-4" />
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
          collapsed ? "mx-auto h-11 w-11 justify-center" : "gap-3 px-3 py-2.5",
          active
            ? activeClassName
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed ? <span>{item.label}</span> : null}
      </Link>
    </li>
  );
}

function isNavActive(pathname: string, item: WorkspaceNavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
