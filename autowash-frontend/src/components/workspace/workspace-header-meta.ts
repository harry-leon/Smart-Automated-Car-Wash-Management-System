type WorkspaceRole = "CUSTOMER" | "STAFF" | "ADMIN";

export type WorkspaceHeaderMeta = {
  title: string;
  subtitle: string;
  workspace: WorkspaceRole;
};

const DEFAULT_SUBTITLE: Record<WorkspaceRole, string> = {
  CUSTOMER: "Quản lý đặt lịch, xe, điểm thưởng và hoạt động tài khoản",
  STAFF: "Quản lý check-in, phiên rửa và vận hành trong ngày",
  ADMIN: "Theo dõi hệ thống, khách hàng, dịch vụ và vận hành",
};

const ROUTE_META: Array<{
  match: (pathname: string) => boolean;
  meta: WorkspaceHeaderMeta;
}> = [
  {
    match: (pathname) => pathname === "/customer/home" || pathname === "/customer",
    meta: {
      title: "Trang chủ khách hàng",
      subtitle: "Điểm thưởng, đặt lịch, xe và thao tác nhanh",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/customer/profile"),
    meta: {
      title: "Hồ sơ cá nhân",
      subtitle: "Thông tin tài khoản và tùy chọn hồ sơ",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/customer/vehicles"),
    meta: {
      title: "Xe của tôi",
      subtitle: "Quản lý xe đã đăng ký và xe chính",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/customer/bookings") || pathname === "/customer/booking",
    meta: {
      title: "Đặt lịch",
      subtitle: "Tạo và theo dõi lịch rửa xe",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/customer/history"),
    meta: {
      title: "Lịch sử rửa xe",
      subtitle: "Xem lại phiên rửa và tiến độ dịch vụ",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/customer/loyalty"),
    meta: {
      title: "Tích điểm và ưu đãi",
      subtitle: "Theo dõi điểm, hạng thành viên và đổi điểm",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/customer/promotions"),
    meta: {
      title: "Khuyến mãi",
      subtitle: "Xem các chương trình và ưu đãi đang hoạt động",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) =>
      pathname.startsWith("/customer/notifications") ||
      pathname.startsWith("/customer/settings") ||
      pathname.startsWith("/customer/combos") ||
      pathname.startsWith("/customer/vouchers"),
    meta: {
      title: "Khu vực khách hàng",
      subtitle: "Xem công cụ, thông báo và tùy chọn khách hàng",
      workspace: "CUSTOMER",
    },
  },
  {
    match: (pathname) => pathname === "/staff/dashboard" || pathname === "/staff",
    meta: {
      title: "Tổng quan nhân viên",
      subtitle: "Lịch đến, trạng thái hàng đợi và việc được giao",
      workspace: "STAFF",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/staff/operations"),
    meta: {
      title: "Bảng vận hành",
      subtitle: "Chuyển phiên rửa qua từng bước xử lý",
      workspace: "STAFF",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/staff/check-in"),
    meta: {
      title: "Check-in xe",
      subtitle: "Xác nhận đặt lịch và đưa xe vào quy trình rửa",
      workspace: "STAFF",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/staff/sessions/history"),
    meta: {
      title: "Lịch sử phiên rửa",
      subtitle: "Tra cứu các phiên đã hoàn thành theo ngày, tháng hoặc năm",
      workspace: "STAFF",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/staff/sessions"),
    meta: {
      title: "Phiên rửa",
      subtitle: "Kiểm tra chi tiết, thời gian và thao tác tiếp theo",
      workspace: "STAFF",
    },
  },
  {
    match: (pathname) => pathname === "/admin/dashboard" || pathname === "/admin",
    meta: {
      title: "Bảng điều khiển quản trị",
      subtitle: "Chỉ số, đặt lịch, hoạt động khách hàng và vận hành",
      workspace: "ADMIN",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/bookings"),
    meta: {
      title: "Quản lý đặt lịch",
      subtitle: "Theo dõi số lượng, trạng thái và phân công",
      workspace: "ADMIN",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/customers"),
    meta: {
      title: "Tài khoản khách hàng",
      subtitle: "Hồ sơ, xe, đặt lịch và lịch sử tích điểm",
      workspace: "ADMIN",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/operations"),
    meta: {
      title: "Tình trạng vận hành",
      subtitle: "Theo dõi phiên đang xử lý và năng lực dịch vụ",
      workspace: "ADMIN",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/reports"),
    meta: {
      title: "Báo cáo và phân tích",
      subtitle: "Doanh thu, hiệu suất dịch vụ và xu hướng khách hàng",
      workspace: "ADMIN",
    },
  },
  {
    match: (pathname) =>
      pathname.startsWith("/admin/packages") ||
      pathname.startsWith("/admin/add-ons") ||
      pathname.startsWith("/admin/combos") ||
      pathname.startsWith("/admin/promotions") ||
      pathname.startsWith("/admin/vouchers") ||
      pathname.startsWith("/admin/staff") ||
      pathname.startsWith("/admin/settings"),
    meta: {
      title: "Khu vực quản trị",
      subtitle: "Cấu hình dịch vụ, khuyến mãi, nhân viên và cài đặt",
      workspace: "ADMIN",
    },
  },
];

export function getWorkspaceHeaderMeta(pathname: string): WorkspaceHeaderMeta {
  const routeMeta = ROUTE_META.find((entry) => entry.match(pathname));
  if (routeMeta) return routeMeta.meta;

  const workspace = resolveWorkspaceFromPath(pathname);
  return {
    title: "Tổng quan",
    subtitle: DEFAULT_SUBTITLE[workspace],
    workspace,
  };
}

function resolveWorkspaceFromPath(pathname: string): WorkspaceRole {
  if (pathname.startsWith("/staff")) return "STAFF";
  if (pathname.startsWith("/admin")) return "ADMIN";
  return "CUSTOMER";
}
