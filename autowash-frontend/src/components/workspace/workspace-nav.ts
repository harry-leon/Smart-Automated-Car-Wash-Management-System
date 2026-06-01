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
    label: "Khu vực khách hàng",
    description: "Đặt lịch và theo dõi dịch vụ",
    accent: "bg-sky-600 text-white shadow-sky-600/20",
    accentSoft: "border-sky-200 bg-sky-50 text-sky-700",
    activeNav: "bg-sky-600 text-white shadow-sm shadow-sky-600/20",
    mobileActive: "bg-sky-50 text-sky-700",
  },
  STAFF: {
    label: "Vận hành nhân viên",
    description: "Tiếp nhận và xử lý phiên rửa",
    accent: "bg-violet-600 text-white shadow-violet-600/20",
    accentSoft: "border-violet-200 bg-violet-50 text-violet-700",
    activeNav: "bg-violet-600 text-white shadow-sm shadow-violet-600/20",
    mobileActive: "bg-violet-50 text-violet-700",
  },
  ADMIN: {
    label: "Bảng điều khiển quản trị",
    description: "Trung tâm quản lý hệ thống",
    accent: "bg-orange-600 text-white shadow-orange-600/20",
    accentSoft: "border-orange-200 bg-orange-50 text-orange-700",
    activeNav: "bg-orange-600 text-white shadow-sm shadow-orange-600/20",
    mobileActive: "bg-orange-50 text-orange-700",
  },
};

const CUSTOMER_NAV: WorkspaceNavItem[] = [
  { href: "/customer/home", label: "Trang chủ", icon: LayoutDashboard, exact: true },
  { href: "/customer/bookings", label: "Đặt lịch", icon: ClipboardList },
  { href: "/customer/vehicles", label: "Xe của tôi", icon: CarFront },
  { href: "/customer/history", label: "Lịch sử", icon: History },
  { href: "/customer/loyalty", label: "Tích điểm", icon: Gift },
  { href: "/customer/promotions", label: "Khuyến mãi", icon: Tag },
  { href: "/customer/notifications", label: "Thông báo", icon: Bell },
  { href: "/customer/settings", label: "Cài đặt", icon: Settings2 },
];

const STAFF_NAV: WorkspaceNavItem[] = [
  { href: "/staff/dashboard", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/staff/operations", label: "Vận hành", icon: ClipboardList },
  { href: "/staff/check-in", label: "Check-in", icon: Wrench },
  { href: "/staff/sessions/history", label: "Lịch sử", icon: History },
];

const ADMIN_NAV: WorkspaceNavItem[] = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Đặt lịch", icon: ClipboardList },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/staff", label: "Nhân viên", icon: Users },
  { href: "/admin/packages", label: "Gói rửa", icon: Droplets },
  { href: "/admin/add-ons", label: "Dịch vụ thêm", icon: Package },
  { href: "/admin/combos", label: "Combo", icon: Sparkles },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: Tag },
  { href: "/admin/vouchers", label: "Mã ưu đãi", icon: Ticket },
  { href: "/admin/operations", label: "Vận hành", icon: Wrench },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings2 },
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
      ["/admin/dashboard", "/admin/bookings", "/admin/customers", "/admin/operations"].includes(item.href),
    );
  }
  return CUSTOMER_NAV.filter((item) =>
    ["/customer/home", "/customer/bookings", "/customer/vehicles", "/customer/loyalty"].includes(item.href),
  );
}
