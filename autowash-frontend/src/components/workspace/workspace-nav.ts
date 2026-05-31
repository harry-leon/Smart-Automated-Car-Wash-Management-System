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
  Package,
  Settings2,
  Sparkles,
  Tag,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";
import type { UserRole } from "@/types/auth.types";

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
    label: "Customer Portal",
    description: "Self-service wash journey",
    accent: "bg-sky-600 text-white shadow-sky-600/20",
    accentSoft: "border-sky-200 bg-sky-50 text-sky-700",
    activeNav: "bg-sky-600 text-white shadow-sm shadow-sky-600/20",
    mobileActive: "bg-sky-50 text-sky-700",
  },
  STAFF: {
    label: "Staff Operations",
    description: "Check-in and wash flow",
    accent: "bg-violet-600 text-white shadow-violet-600/20",
    accentSoft: "border-violet-200 bg-violet-50 text-violet-700",
    activeNav: "bg-violet-600 text-white shadow-sm shadow-violet-600/20",
    mobileActive: "bg-violet-50 text-violet-700",
  },
  ADMIN: {
    label: "Admin Dashboard",
    description: "System control center",
    accent: "bg-orange-600 text-white shadow-orange-600/20",
    accentSoft: "border-orange-200 bg-orange-50 text-orange-700",
    activeNav: "bg-orange-600 text-white shadow-sm shadow-orange-600/20",
    mobileActive: "bg-orange-50 text-orange-700",
  },
};

const CUSTOMER_NAV: WorkspaceNavItem[] = [
  { href: "/customer/home", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/customer/bookings", label: "Bookings", icon: ClipboardList },
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
];

const ADMIN_NAV: WorkspaceNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/packages", label: "Packages", icon: Droplets },
  { href: "/admin/add-ons", label: "Add-ons", icon: Package },
  { href: "/admin/combos", label: "Combos", icon: Sparkles },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/vouchers", label: "Vouchers", icon: Ticket },
  { href: "/admin/operations", label: "Operations", icon: Wrench },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

export const SHELL_EXCLUDED_PATHS = ["/admin/login"];

export function navForRole(role: UserRole): WorkspaceNavItem[] {
  if (role === "STAFF") {
    return STAFF_NAV;
  }
  if (role === "ADMIN") {
    return ADMIN_NAV;
  }
  return CUSTOMER_NAV;
}

export function mobileNavForRole(role: UserRole): WorkspaceNavItem[] {
  if (role === "STAFF") {
    return STAFF_NAV;
  }
  if (role === "ADMIN") {
    return ADMIN_NAV.filter((item) =>
      ["/admin/dashboard", "/admin/bookings", "/admin/customers", "/admin/operations"].includes(
        item.href,
      ),
    );
  }
  return CUSTOMER_NAV.filter((item) =>
    ["/customer/home", "/customer/bookings", "/customer/vehicles", "/customer/loyalty"].includes(
      item.href,
    ),
  );
}
