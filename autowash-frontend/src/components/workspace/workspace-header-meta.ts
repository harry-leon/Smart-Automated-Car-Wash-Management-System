export type WorkspaceHeaderMeta = {
  title: string;
  titleVi: string;
  subtitle: string;
  subtitleVi: string;
};

const DEFAULT_META: WorkspaceHeaderMeta = {
  title: "Overview",
  titleVi: "Tổng quan",
  subtitle: "Manage your workspace activities",
  subtitleVi: "Quản lý hoạt động trong không gian làm việc",
};

const PATH_META: Array<{ match: (path: string) => boolean; meta: WorkspaceHeaderMeta }> = [
  {
    match: (p) => p === "/customer/home",
    meta: {
      title: "Customer Home",
      titleVi: "Trang khách hàng",
      subtitle: "Points, bookings, and quick actions",
      subtitleVi: "Điểm thưởng, lịch đặt và thao tác nhanh",
    },
  },
  {
    match: (p) => p.startsWith("/customer/profile"),
    meta: {
      title: "Personal Profile",
      titleVi: "Hồ sơ cá nhân",
      subtitle: "Account information and preferences",
      subtitleVi: "Thông tin tài khoản và tùy chọn",
    },
  },
  {
    match: (p) => p.startsWith("/customer/vehicles"),
    meta: {
      title: "My Vehicles",
      titleVi: "Xe của tôi",
      subtitle: "Manage registered vehicles",
      subtitleVi: "Quản lý xe đã đăng ký",
    },
  },
  {
    match: (p) => p.includes("/bookings"),
    meta: {
      title: "Bookings",
      titleVi: "Lịch đặt",
      subtitle: "Create and track wash appointments",
      subtitleVi: "Đặt lịch và theo dõi lịch hẹn rửa xe",
    },
  },
  {
    match: (p) => p.startsWith("/customer/history"),
    meta: {
      title: "Wash History",
      titleVi: "Lịch sử rửa xe",
      subtitle: "Past sessions and live tracking",
      subtitleVi: "Phiên rửa trước đây và theo dõi trực tiếp",
    },
  },
  {
    match: (p) => p.startsWith("/customer/loyalty"),
    meta: {
      title: "Loyalty & Rewards",
      titleVi: "Tích điểm & quà thưởng",
      subtitle: "Points, tiers, and redemption",
      subtitleVi: "Điểm, hạng thành viên và đổi quà",
    },
  },
  {
    match: (p) => p.startsWith("/customer/notifications"),
    meta: {
      title: "Notifications",
      titleVi: "Thông báo",
      subtitle: "Booking updates and alerts",
      subtitleVi: "Cập nhật lịch hẹn và cảnh báo",
    },
  },
  {
    match: (p) => p.startsWith("/customer/settings"),
    meta: {
      title: "Settings",
      titleVi: "Cài đặt",
      subtitle: "Language, theme, and notification preferences",
      subtitleVi: "Ngôn ngữ, giao diện và thông báo",
    },
  },
  {
    match: (p) => p === "/staff/dashboard",
    meta: {
      title: "Staff Dashboard",
      titleVi: "Bảng điều khiển nhân viên",
      subtitle: "Arrivals, walk-ins, and queue overview",
      subtitleVi: "Khách đến, walk-in và tổng quan hàng đợi",
    },
  },
  {
    match: (p) => p.startsWith("/staff/operations"),
    meta: {
      title: "Operations Board",
      titleVi: "Bảng vận hành",
      subtitle: "Kanban queue for wash sessions",
      subtitleVi: "Hàng đợi Kanban cho phiên rửa xe",
    },
  },
  {
    match: (p) => p.startsWith("/staff/check-in"),
    meta: {
      title: "Vehicle Check-in",
      titleVi: "Check-in biển số",
      subtitle: "Confirm plate and start wash flow",
      subtitleVi: "Xác nhận biển số và bắt đầu quy trình rửa",
    },
  },
  {
    match: (p) => p.startsWith("/staff/sessions"),
    meta: {
      title: "Wash Session",
      titleVi: "Phiên rửa xe",
      subtitle: "Session detail and timer controls",
      subtitleVi: "Chi tiết phiên và điều khiển bộ đếm",
    },
  },
  {
    match: (p) => p === "/admin/dashboard",
    meta: {
      title: "Admin Control Panel",
      titleVi: "Bảng quản trị",
      subtitle: "KPIs, bookings, and system health",
      subtitleVi: "KPI, lịch đặt và tình trạng hệ thống",
    },
  },
  {
    match: (p) => p.startsWith("/admin/bookings"),
    meta: {
      title: "Booking Management",
      titleVi: "Quản lý lịch đặt",
      subtitle: "All bookings and staff assignment",
      subtitleVi: "Toàn bộ lịch đặt và phân công nhân viên",
    },
  },
  {
    match: (p) => p.startsWith("/admin/customers"),
    meta: {
      title: "Customer Accounts",
      titleVi: "Tài khoản khách hàng",
      subtitle: "Profiles, vehicles, and loyalty history",
      subtitleVi: "Hồ sơ, xe và lịch sử tích điểm",
    },
  },
  {
    match: (p) => p.startsWith("/admin/reports"),
    meta: {
      title: "Reports & Analytics",
      titleVi: "Báo cáo & phân tích",
      subtitle: "Revenue and operational insights",
      subtitleVi: "Doanh thu và chỉ số vận hành",
    },
  },
];

export function getWorkspaceHeaderMeta(pathname: string): WorkspaceHeaderMeta {
  const match = PATH_META.find((entry) => entry.match(pathname));
  return match?.meta ?? DEFAULT_META;
}
