import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CarFront,
  ClipboardList,
  Droplets,
  Gift,
  LayoutDashboard,
  Package,
  Settings2,
  Sparkles,
  Ticket,
  Users,
  Wrench,
  Bell,
  History,
  Tag,
} from "lucide-react";
import type { UserRole } from "@/types/auth.types";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  labelVi: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type WorkspaceTheme = {
  id: UserRole;
  workspaceLabel: string;
  workspaceLabelVi: string;
  accentClass: string;
  accentMutedClass: string;
  sidebarRingClass: string;
  mobileNavActiveClass: string;
};

export const WORKSPACE_THEMES: Record<UserRole, WorkspaceTheme> = {
  CUSTOMER: {
    id: "CUSTOMER",
    workspaceLabel: "Customer Portal",
    workspaceLabelVi: "Cổng khách hàng",
    accentClass: "bg-sky-600 text-white shadow-sky-600/25",
    accentMutedClass: "bg-sky-50 text-sky-700 border-sky-200",
    sidebarRingClass: "ring-sky-500/20",
    mobileNavActiveClass: "text-sky-700",
  },
  STAFF: {
    id: "STAFF",
    workspaceLabel: "Staff Operations",
    workspaceLabelVi: "Vận hành nhân viên",
    accentClass: "bg-violet-600 text-white shadow-violet-600/25",
    accentMutedClass: "bg-violet-50 text-violet-700 border-violet-200",
    sidebarRingClass: "ring-violet-500/20",
    mobileNavActiveClass: "text-violet-700",
  },
  ADMIN: {
    id: "ADMIN",
    workspaceLabel: "Admin Dashboard",
    workspaceLabelVi: "Bảng quản trị",
    accentClass: "bg-orange-600 text-white shadow-orange-600/25",
    accentMutedClass: "bg-orange-50 text-orange-700 border-orange-200",
    sidebarRingClass: "ring-orange-500/20",
    mobileNavActiveClass: "text-orange-700",
  },
};

export const CUSTOMER_NAV: WorkspaceNavItem[] = [
  { href: "/customer/home", label: "Home", labelVi: "Trang chủ", icon: LayoutDashboard, exact: true },
  { href: "/customer/bookings", label: "Bookings", labelVi: "Lịch đặt", icon: ClipboardList },
  { href: "/customer/vehicles", label: "Vehicles", labelVi: "Xe của tôi", icon: CarFront },
  { href: "/customer/loyalty", label: "Loyalty", labelVi: "Tích điểm", icon: Gift },
  { href: "/customer/history", label: "History", labelVi: "Lịch sử", icon: History },
  { href: "/customer/promotions", label: "Promotions", labelVi: "Khuyến mãi", icon: Tag },
  { href: "/customer/notifications", label: "Notifications", labelVi: "Thông báo", icon: Bell },
  { href: "/customer/settings", label: "Settings", labelVi: "Cài đặt", icon: Settings2 },
];

export const STAFF_NAV: WorkspaceNavItem[] = [
  {
    href: "/staff/dashboard",
    label: "Dashboard",
    labelVi: "Bảng điều khiển",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/staff/operations", label: "Operations", labelVi: "Vận hành", icon: ClipboardList },
  { href: "/staff/check-in", label: "Check-in", labelVi: "Check-in", icon: Wrench },
];

export const ADMIN_NAV: WorkspaceNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    labelVi: "Bảng điều khiển",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/bookings", label: "Bookings", labelVi: "Lịch đặt", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", labelVi: "Khách hàng", icon: Users },
  { href: "/admin/staff", label: "Staff", labelVi: "Nhân viên", icon: Users },
  { href: "/admin/packages", label: "Packages", labelVi: "Gói rửa xe", icon: Droplets },
  { href: "/admin/add-ons", label: "Add-ons", labelVi: "Dịch vụ thêm", icon: Package },
  { href: "/admin/combos", label: "Combos", labelVi: "Combo", icon: Sparkles },
  { href: "/admin/promotions", label: "Promotions", labelVi: "Khuyến mãi", icon: Tag },
  { href: "/admin/vouchers", label: "Vouchers", labelVi: "Voucher", icon: Ticket },
  { href: "/admin/operations", label: "Operations", labelVi: "Vận hành", icon: Wrench },
  { href: "/admin/reports", label: "Reports", labelVi: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", labelVi: "Cài đặt", icon: Settings2 },
];

export function navForRole(role: UserRole): WorkspaceNavItem[] {
  if (role === "STAFF") return STAFF_NAV;
  if (role === "ADMIN") return ADMIN_NAV;
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

export const SHELL_EXCLUDED_PATHS = ["/admin/login"];
