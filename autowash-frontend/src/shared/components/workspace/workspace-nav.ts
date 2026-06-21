import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  CarFront,
  ClipboardList,
  Droplets,
  Gift,
  History,
  LayoutDashboard,
  Layers3,
  Package,
  Radar,
  Settings2,
  Sparkles,
  Tag,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";
import type { UserRole } from "@/features/auth/auth.types";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type WorkspaceTheme = {
  label: string;
  description: string;
  accent: string;
  accentSoft: string;
  activeNav: string;
  mobileActive: string;
};

export const WORKSPACE_THEMES: Record<UserRole, WorkspaceTheme> = {
  CUSTOMER: {
    label: "Customer",
    description: "Bookings and wash tracking",
    accent: "bg-slate-950 text-cyan-400 border border-slate-800 shadow-[0_4px_20px_rgba(6,182,212,0.15)]",
    accentSoft: "border-cyan-200 bg-cyan-50/50 text-cyan-800",
    activeNav: "bg-slate-950 text-white border border-slate-800 shadow-sm",
    mobileActive: "bg-cyan-50 text-cyan-800",
  },
  STAFF: {
    label: "Staff",
    description: "Check-in and wash flow",
    accent: "bg-slate-950 text-lime-400 border border-slate-800 shadow-[0_4px_20px_rgba(132,204,22,0.15)]",
    accentSoft: "border-lime-200 bg-lime-50/50 text-lime-800",
    activeNav: "bg-slate-950 text-white border border-slate-800 shadow-sm",
    mobileActive: "bg-lime-50 text-lime-800",
  },
  ADMIN: {
    label: "Admin",
    description: "System control center",
    accent: "bg-slate-950 text-slate-100 border border-slate-800 shadow-[0_4px_20px_rgba(15,23,42,0.15)]",
    accentSoft: "border-slate-200 bg-slate-100 text-slate-800",
    activeNav: "bg-slate-950 text-white border border-slate-800 shadow-sm",
    mobileActive: "bg-slate-100 text-slate-900",
  },
};


const CUSTOMER_NAV: WorkspaceNavItem[] = [
  { href: "/customer/home", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/customer/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/customer/wash-tracking", label: "Wash Tracking", icon: Radar },
  { href: "/customer/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/customer/history", label: "History", icon: History },
  { href: "/customer/loyalty", label: "Loyalty", icon: Gift },
  { href: "/customer/promotions", label: "Promotions", icon: Tag },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
  { href: "/customer/settings", label: "Settings", icon: Settings2 },
];

const STAFF_NAV: WorkspaceNavItem[] = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/staff/operations", label: "Operations", icon: ClipboardList },
  { href: "/staff/check-in", label: "Check-in", icon: Wrench },
  { href: "/staff/sessions/history", label: "History", icon: History },
];

const ADMIN_NAV: WorkspaceNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/accounts", label: "Accounts", icon: Users },
  { href: "/admin/services", label: "Service Management", icon: Layers3 },
  { href: "/admin/offers", label: "Offers Management", icon: Gift },
  { href: "/admin/operations", label: "Operations", icon: Wrench },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

export const SHELL_EXCLUDED_PATHS = ["/admin/login"];

export function navForRole(role: UserRole): WorkspaceNavItem[] {
  if (role === "STAFF") return STAFF_NAV;
  if (role === "ADMIN") return ADMIN_NAV;
  return CUSTOMER_NAV;
}

export function mobileNavForRole(role: UserRole): WorkspaceNavItem[] {
  if (role === "STAFF") return STAFF_NAV;
  if (role === "ADMIN") {
    return ADMIN_NAV.filter((item) =>
      ["/admin/dashboard", "/admin/bookings", "/admin/accounts", "/admin/operations"].includes(
        item.href,
      ),
    );
  }
  return CUSTOMER_NAV.filter((item) =>
    ["/customer/home", "/customer/bookings", "/customer/wash-tracking", "/customer/loyalty"].includes(
      item.href,
    ),
  );
}
