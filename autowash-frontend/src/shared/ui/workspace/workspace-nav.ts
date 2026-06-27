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
  Radar,
  Settings2,
  Tag,
  Users,
  Wrench,
} from "lucide-react";
import type { UserRole } from "@/entities/auth";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  labelVi?: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type WorkspaceTheme = {
  label: string;
  labelVi?: string;
  description: string;
  descriptionVi?: string;
  accent: string;
  accentSoft: string;
  activeNav: string;
  mobileActive: string;
};

export const WORKSPACE_THEMES: Record<UserRole, WorkspaceTheme> = {
  CUSTOMER: {
    label: "Customer Portal",
    labelVi: "Cổng khách hàng",
    description: "Bookings and wash tracking",
    descriptionVi: "Đặt lịch & Theo dõi rửa xe",
    accent: "bg-teal-600 text-white shadow-teal-600/20",
    accentSoft: "border-teal-200 bg-teal-50 text-teal-700",
    activeNav: "bg-teal-600 text-white shadow-sm shadow-teal-600/20",
    mobileActive: "bg-teal-50 text-teal-700",
  },
  STAFF: {
    label: "Staff Operations",
    labelVi: "Nghiệp vụ nhân viên",
    description: "Check-in and wash flow",
    descriptionVi: "Duyệt check-in & Quy trình",
    accent: "bg-teal-600 text-white shadow-teal-600/20",
    accentSoft: "border-teal-200 bg-teal-50 text-teal-700",
    activeNav: "bg-teal-600 text-white shadow-sm shadow-teal-600/20",
    mobileActive: "bg-teal-50 text-teal-700",
  },
  ADMIN: {
    label: "Admin Dashboard",
    labelVi: "Bảng quản trị",
    description: "System control center",
    descriptionVi: "Trung tâm quản trị hệ thống",
    accent: "bg-teal-600 text-white shadow-teal-600/20",
    accentSoft: "border-teal-200 bg-teal-50 text-teal-700",
    activeNav: "bg-teal-600 text-white shadow-sm shadow-teal-600/20",
    mobileActive: "bg-teal-50 text-teal-700",
  },
};

const CUSTOMER_NAV: WorkspaceNavItem[] = [
  { href: "/customer/home", label: "Home", labelVi: "Trang chủ", icon: LayoutDashboard, exact: true },
  { href: "/customer/bookings", label: "Bookings", labelVi: "Lịch đặt", icon: ClipboardList },
  { href: "/customer/wash-tracking", label: "Wash Tracking", labelVi: "Theo dõi rửa xe", icon: Radar },
  { href: "/customer/vehicles", label: "Vehicles", labelVi: "Phương tiện", icon: CarFront },
  { href: "/customer/history", label: "History", labelVi: "Lịch sử", icon: History },
  { href: "/customer/loyalty", label: "Loyalty", labelVi: "Tích điểm", icon: Gift },
  { href: "/customer/promotions", label: "Promotions", labelVi: "Khuyến mãi", icon: Tag },
];

const STAFF_NAV: WorkspaceNavItem[] = [
  { href: "/staff/dashboard", label: "Dashboard", labelVi: "Trang chủ", icon: LayoutDashboard, exact: true },
  { href: "/staff/operations", label: "Operations", labelVi: "Vận hành", icon: ClipboardList },
  { href: "/staff/check-in", label: "Check-in", labelVi: "Duyệt check-in", icon: Wrench },
  { href: "/staff/sessions/history", label: "History", labelVi: "Lịch sử", icon: History },
];

const ADMIN_NAV: WorkspaceNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", labelVi: "Trang chủ", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", labelVi: "Quản lý đặt lịch", icon: ClipboardList },
  { href: "/admin/accounts", label: "Accounts", labelVi: "Tài khoản", icon: Users },
  { href: "/admin/services", label: "Service Management", labelVi: "Quản lý dịch vụ", icon: Layers3 },
  { href: "/admin/offers?tab=promotions", label: "Offers Management", labelVi: "Ưu đãi & Voucher", icon: Gift },
  { href: "/admin/operations", label: "Operations", labelVi: "Vận hành", icon: Wrench },
  { href: "/admin/reports", label: "Reports", labelVi: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", labelVi: "Cài đặt", icon: Settings2 },
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
