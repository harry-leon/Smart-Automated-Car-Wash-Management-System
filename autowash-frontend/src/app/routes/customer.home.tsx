import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarCheck,
  CarFront,
  ChevronRight,
  Crown,
  Droplets,
  Gift,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  Zap,
  Plus,
  Coins,
  History,
  Clock,
  QrCode,
  CheckCircle,
  ArrowRight,
  Activity,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCarwashStore, type Tier } from "@/lib/carwash-store";
import { useCustomerBooking } from "@/app/modules/customer-booking/routes";
import type { BookingStatus } from "@/app/modules/customer-booking/types/booking.types";
import type { CustomerProfile } from "@/app/modules/customer-booking/types/customer.types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/home")({
  component: () => <CustomerHome />,
});

const activeStatuses: BookingStatus[] = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

function mapPortalTier(tier: Tier): CustomerProfile["tier"] {
  if (tier === "Gold") return "Gold";
  if (tier === "Platinum") return "Diamond";
  return "Silver";
}

function getGreeting(language: "en" | "vi") {
  const hour = new Date().getHours();
  if (language === "vi") {
    if (hour >= 5 && hour < 12) return "Chào buổi sáng ☀️";
    if (hour >= 12 && hour < 18) return "Chào buổi chiều 🌤️";
    return "Chào buổi tối 🌙";
  } else {
    if (hour >= 5 && hour < 12) return "Good morning ☀️";
    if (hour >= 12 && hour < 18) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatRemainingTime(ms: number, language: "en" | "vi") {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (language === "vi") {
    if (minutes <= 0) return `${seconds} giay`;
    return `${minutes} phut ${seconds.toString().padStart(2, "0")}s`;
  }

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes} mins ${seconds.toString().padStart(2, "0")}s`;
}

function CustomerHome() {
  const navigate = useNavigate();
  const portalStore = useCarwashStore();
  const {
    activeCombo,
    bookings,
    comboPackages,
    customer: bookingCustomer,
    language,
    redeemPointsForVoucher,
    servicePackages,
    setBookingDraft,
    vehicles,
  } = useCustomerBooking();

  const portalCustomer = portalStore.customers.find(
    (customer) => customer.id === portalStore.currentCustomerId,
  );

  const customer = portalCustomer
    ? {
        ...bookingCustomer,
        id: portalCustomer.id,
        fullName: portalCustomer.name,
        tier: mapPortalTier(portalCustomer.tier),
        isNewCustomer: portalCustomer.tier === "Member",
        availablePoints: portalCustomer.points,
        lifetimePoints: Math.max(bookingCustomer.lifetimePoints, portalCustomer.points),
      }
    : bookingCustomer;

  const [redeemPoints, setRedeemPoints] = useState(50);
  const [redeemMessage, setRedeemMessage] = useState("");
  const [showBarcode, setShowBarcode] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const copy =
    language === "vi"
      ? {
          member: "thành viên",
          welcome: getGreeting("vi"),
          intro: "Quản lý đặt lịch, xe, voucher và combo trong một không gian khách hàng gọn gàng.",
          book: "Đặt lịch rửa xe",
          history: "Xem lịch sử",
          available: "Điểm khả dụng",
          lifetime: "Điểm tích lũy",
          activeBookings: "Lịch đang hoạt động",
          aura: "Aura car care",
          clipTitle: "Đặt lịch nhanh, chăm xe sạch hơn.",
          clipText:
            "Đặt lịch rửa, theo dõi xe, quản lý combo và đổi điểm thành voucher ngay trên dashboard.",
          defaultVehicle: "Xe thanh toán mặc định",
          noVehicle: "Chưa có xe",
          addVehicle: "Thêm xe trước khi đặt lịch.",
          manageVehicles: "Quản lý xe",
          bookMinutes: "Đặt lịch trong vài phút",
          bookMinutesText: "Chọn xe, gói rửa, lịch, voucher và thanh toán trong một luồng.",
          track: "Theo dõi trạng thái",
          trackText: "Xem check-in và tiến trình rửa khi xe đang được phục vụ.",
          rewards: "Dùng ưu đãi rõ ràng",
          rewardsText: "Điểm đổi thành voucher trước, checkout đơn giản và minh bạch.",
          inWash: "Xe đang được rửa",
          viewDetails: "Xem chi tiết",
          pointsVoucher: "Đổi điểm thành voucher",
          generateVoucher: "Tạo voucher checkout",
          pointsHint: "Điểm được đổi trước checkout. Mỗi booking chỉ dùng một voucher hợp lệ.",
          points: "Điểm",
          voucherValue: "giá trị voucher",
          generate: "Tạo voucher",
          activeCombo: "Combo đang hoạt động",
          noCombo: "Chưa có combo đang dùng",
          buyCombo: "Mua combo từ danh sách bên dưới.",
          bookCombo: "Đặt bằng combo",
          washPlan: "Gói rửa",
          packagesTitle: "Gói cho lần rửa tiếp theo",
          packagesText: "Chọn một gói để đi tiếp tới checkout.",
          openBooking: "Mở đặt lịch",
          select: "Chọn",
          comboPlans: "Combo tháng",
          upgradeTitle: "Chỉ nâng cấp combo đang dùng",
          upgradeText: "Gói thấp hơn bị khóa. Checkout chỉ tính phần chênh lệch.",
          activePlan: "Gói hiện tại",
          downgradeLocked: "Không thể giảm gói",
          upgrade: "Nâng cấp",

          // New keys
          pointsPresetLabel: "Chọn mức điểm nhanh:",
          voucherDiscountText: "Voucher ưu đãi Aura Care",
          scanAtCheckin: "Đưa mã vạch cho nhân viên quét khi check-in",
          upgradeAmountLabel: "Nâng cấp gói chỉ cần bù chênh lệch:",
          featuresLabel: "Chi tiết gói rửa:",
          quickActions: "Lối tắt nhanh",
          activityTracker: "Tiến trình rửa trực tuyến",
          checkedInStage: "Đã nhận xe",
          washingStage: "Đang rửa",
          detailingStage: "Lau khô & Detailing",
          readyStage: "Sẵn sàng",
          pointsAvailableTitle: "Điểm khả dụng",
          pointsLifetimeTitle: "Tổng tích lũy",
          activeBookingsTitle: "Lịch hẹn",
          memberCardTitle: "THẺ THÀNH VIÊN VIP",
          popularTag: "Phổ biến",
          premiumTag: "Cao cấp",
          economyTag: "Tiết kiệm",
          statusActive: "Đang hoạt động",
          estimatedTime: "Thời gian còn lại dự kiến",
          minutes: "phút",
          viewBarcode: "Hiển thị mã vạch quét",
          hideBarcode: "Ẩn mã vạch",
        }
      : {
          member: "member",
          welcome: getGreeting("en"),
          intro:
            "Manage bookings, vehicle readiness, vouchers, and combo credits from one clean customer workspace.",
          book: "Book a wash",
          history: "View history",
          available: "Available points",
          lifetime: "Lifetime points",
          activeBookings: "Active bookings",
          aura: "Aura car care",
          clipTitle: "Smart wash, quick booking, cleaner ownership.",
          clipText:
            "Book a wash, track your vehicle, manage combos, and redeem point vouchers from the same customer dashboard.",
          defaultVehicle: "Default checkout vehicle",
          noVehicle: "No vehicle",
          addVehicle: "Add a vehicle before booking.",
          manageVehicles: "Manage vehicles",
          bookMinutes: "Book in minutes",
          bookMinutesText:
            "Select your vehicle, package, slot, voucher, and payment method in one flow.",
          track: "Track live status",
          trackText: "Follow check-in and wash progress when your vehicle is being serviced.",
          rewards: "Use rewards clearly",
          rewardsText: "Points become vouchers first, so checkout stays simple and auditable.",
          inWash: "Vehicle in wash",
          viewDetails: "View details",
          pointsVoucher: "Points to voucher",
          generateVoucher: "Generate checkout voucher",
          pointsHint:
            "Points are redeemed before checkout. Only one valid voucher can be used per booking.",
          points: "Points",
          voucherValue: "voucher value",
          generate: "Generate",
          activeCombo: "Active combo",
          noCombo: "No active combo",
          buyCombo: "Buy a combo from the plan list below.",
          bookCombo: "Book with combo",
          washPlan: "Wash plan",
          packagesTitle: "Packages for your next visit",
          packagesText: "Select a package to continue to the booking checkout.",
          openBooking: "Open booking flow",
          select: "Select",
          comboPlans: "Combo plans",
          upgradeTitle: "Upgrade active combo only",
          upgradeText:
            "Lower-tier plans are locked. Upgrade charges only the price difference at checkout.",
          activePlan: "Active plan",
          downgradeLocked: "Downgrade locked",
          upgrade: "Upgrade",

          // New keys
          pointsPresetLabel: "Quick points selection:",
          voucherDiscountText: "Aura Care Reward Voucher",
          scanAtCheckin: "Show this barcode to staff at check-in",
          upgradeAmountLabel: "Upgrade difference only:",
          featuresLabel: "Highlights included:",
          quickActions: "Quick Shortcuts",
          activityTracker: "Live Wash Progress Tracker",
          checkedInStage: "Check-in",
          washingStage: "In Wash",
          detailingStage: "Detailing",
          readyStage: "Ready",
          pointsAvailableTitle: "Redeemable points",
          pointsLifetimeTitle: "Lifetime points",
          activeBookingsTitle: "Appointments",
          memberCardTitle: "VIP MEMBERSHIP CARD",
          popularTag: "Popular",
          premiumTag: "Premium",
          economyTag: "Value",
          statusActive: "Active",
          estimatedTime: "Est. remaining time",
          minutes: "mins",
          viewBarcode: "Show barcode",
          hideBarcode: "Hide barcode",
        };

  const defaultVehicle = vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0];
  const linkedVehicle = activeCombo
    ? vehicles.find((vehicle) => vehicle.id === activeCombo.linkedVehicleId)
    : undefined;
  const currentCombo = activeCombo
    ? comboPackages.find((comboPackage) => comboPackage.id === activeCombo.comboPackageId)
    : undefined;
  const inProgress = bookings.find((booking) => booking.status === "IN_PROGRESS");
  const activeWashSession = [...portalStore.washSessions]
    .filter(
      (session) =>
        session.customerId === portalStore.currentCustomerId && session.status !== "Completed",
    )
    .sort((a, b) => {
      const priority = (status: string) => {
        if (status === "In Progress") return 0;
        if (status === "Queued") return 1;
        if (status === "Ready for Checkout") return 2;
        return 3;
      };

      const priorityDiff = priority(a.status) - priority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    })[0];

  const trackedBooking =
    (activeWashSession?.bookingId
      ? bookings.find((booking) => booking.id === activeWashSession.bookingId)
      : undefined) ??
    (activeWashSession
      ? bookings.find((booking) => booking.vehicle.licensePlate === activeWashSession.plate)
      : undefined) ??
    inProgress;
  const activeBookingCount = bookings.filter((booking) =>
    activeStatuses.includes(booking.status),
  ).length;

  const startSingleBooking = (packageId?: string) => {
    setBookingDraft({
      mode: "SINGLE_PACKAGE",
      packageId: packageId ?? servicePackages[0]?.id,
      vehicleId: defaultVehicle?.id,
      useActiveCombo: false,
      voucherId: "",
    });
    navigate({ to: "/customer/bookings" });
  };

  const startComboBooking = () => {
    if (!activeCombo || !linkedVehicle || !currentCombo) return;

    setBookingDraft({
      mode: "COMBO",
      packageId: currentCombo.packageIds[0] ?? servicePackages[0]?.id,
      vehicleId: linkedVehicle.id,
      useActiveCombo: true,
      voucherId: "",
      addonIds: [],
      paymentMethod: "",
    });
    navigate({ to: "/customer/bookings" });
  };

  const upgradeCombo = (comboPackageId: string) => {
    const target = comboPackages.find((comboPackage) => comboPackage.id === comboPackageId);

    if (!target || !currentCombo || target.price <= currentCombo.price) return;

    setBookingDraft({
      mode: "SINGLE_PACKAGE",
      packageId: target.packageIds[0] ?? servicePackages[0]?.id,
      vehicleId: defaultVehicle?.id,
      comboUpgradePackageId: target.id,
      comboUpgradeAmount: target.price - currentCombo.price,
      useActiveCombo: false,
      voucherId: "",
    });
    navigate({ to: "/customer/bookings" });
  };

  const redeemVoucher = () => {
    try {
      const voucher = redeemPointsForVoucher(redeemPoints);
      setRedeemMessage(
        `${voucher.code} generated, ${voucher.discountAmount.toLocaleString()} VND off until ${
          voucher.expiresAt
        }.`,
      );
    } catch (error) {
      setRedeemMessage(error instanceof Error ? error.message : "Unable to generate voucher.");
    }
  };

  // Determine card styles based on Customer Tier
  const getTierCardDetails = (tier: string) => {
    switch (tier) {
      case "Diamond":
        return {
          cardBg:
            "bg-gradient-to-br from-[#063047] via-[#10567e] to-[#041a29] border border-cyan-400/50 shadow-[0_20px_50px_-15px_rgba(6,182,212,0.45)] text-cyan-50",
          glowDot: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-pulse",
          chipGradient: "from-cyan-200 to-sky-400",
        };
      case "Gold":
        return {
          cardBg:
            "bg-gradient-to-br from-[#2b1800] via-[#cfa025] to-[#473000] border border-yellow-500/40 shadow-[0_20px_50px_-15px_rgba(234,179,8,0.4)] text-yellow-50",
          glowDot: "bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.7)]",
          chipGradient: "from-amber-200 to-yellow-500",
        };
      default: // Silver
        return {
          cardBg:
            "bg-gradient-to-br from-[#1e293b] via-[#64748b] to-[#0f172a] border border-slate-400/30 shadow-[0_20px_50px_-15px_rgba(100,116,139,0.35)] text-slate-100",
          glowDot: "bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.7)]",
          chipGradient: "from-slate-300 to-slate-500",
        };
    }
  };

  const tierDetails = getTierCardDetails(customer.tier);

  // Loyalty status progress variables
  const tierTarget =
    customer.tier === "Silver" ? 5000 : customer.tier === "Gold" ? 12000 : customer.lifetimePoints;
  const tierBase = customer.tier === "Silver" ? 0 : customer.tier === "Gold" ? 5000 : 12000;
  const progressPercent =
    customer.tier === "Diamond"
      ? 100
      : Math.min(
          100,
          Math.round(((customer.lifetimePoints - tierBase) / (tierTarget - tierBase)) * 100),
        );
  const nextTierName = customer.tier === "Silver" ? "Gold" : "Diamond";
  const pointsToNext = Math.max(0, tierTarget - customer.lifetimePoints);
  const trackedDurationMinutes = Math.max(
    5,
    activeWashSession?.services.reduce((sum, service) => sum + (service.durationMinutes ?? 0), 0) ??
      0,
    (trackedBooking?.package.durationMinutes ?? 0) +
      (trackedBooking?.addOns ?? []).reduce((sum, addOn) => sum + addOn.durationMinutes, 0),
  );
  const trackedStatus =
    activeWashSession?.status ??
    (trackedBooking?.status === "CHECKED_IN"
      ? "Queued"
      : trackedBooking?.status === "IN_PROGRESS"
        ? "In Progress"
        : null);
  const trackedStartedAtMs = new Date(
    activeWashSession?.startedAt ?? trackedBooking?.createdAt ?? now,
  ).getTime();
  const elapsedMs = Math.max(0, now - trackedStartedAtMs);
  const estimatedTotalMs = trackedDurationMinutes * 60 * 1000;
  const phaseRatio = clamp(elapsedMs / estimatedTotalMs, 0, 1);
  const progressStepIndex =
    trackedStatus === "Queued"
      ? 0
      : trackedStatus === "In Progress"
        ? phaseRatio >= 0.72
          ? 2
          : 1
        : trackedStatus === "Ready for Checkout"
          ? 3
          : 0;
  const trackerProgressPercent =
    trackedStatus === "Queued"
      ? 18
      : trackedStatus === "In Progress"
        ? Math.round(clamp(25 + phaseRatio * 60, 25, 92))
        : trackedStatus === "Ready for Checkout"
          ? 100
          : 0;
  const remainingMs =
    trackedStatus === "Ready for Checkout" ? 0 : Math.max(0, estimatedTotalMs - elapsedMs);
  const trackerVehiclePlate =
    trackedBooking?.vehicle.licensePlate ?? activeWashSession?.plate ?? "--";
  const trackerServiceName =
    trackedBooking?.package.name ??
    activeWashSession?.services.map((service) => service.name).join(", ") ??
    copy.inWash;
  const washProgressSteps = [
    {
      label: copy.checkedInStage,
      completed: progressStepIndex > 0,
      active: progressStepIndex === 0,
    },
    { label: copy.washingStage, completed: progressStepIndex > 1, active: progressStepIndex === 1 },
    {
      label: copy.detailingStage,
      completed: progressStepIndex > 2,
      active: progressStepIndex === 2,
    },
    {
      label: copy.readyStage,
      completed: trackedStatus === "Ready for Checkout",
      active: progressStepIndex === 3,
    },
  ];

  const getPackageTag = (pkgId: string) => {
    if (pkgId === "pkg-premium") return copy.popularTag;
    if (pkgId === "pkg-detail") return copy.premiumTag;
    return copy.economyTag;
  };

  const getPackageTagClass = (pkgId: string) => {
    if (pkgId === "pkg-premium") return "bg-primary/10 text-primary border-primary/25";
    if (pkgId === "pkg-detail") return "bg-purple-500/10 text-purple-600 border-purple-500/25";
    return "bg-slate-500/10 text-slate-600 border-slate-500/25";
  };

  const bars = (activeCombo?.qrCodeText ?? "AURA-COMBO-MOCK").split("").slice(0, 18);

  return (
    <div className="relative min-h-screen px-4 py-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden bg-background">
      {/* Dynamic Keyframes Styling Inject */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        .animate-shimmer {
          animation: shimmer 6s infinite linear;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4)); }
          50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8)); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s infinite ease-in-out;
        }
      `,
        }}
      />

      {/* Decorative ambient background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/4 blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] right-[15%] w-[35%] h-[35%] rounded-full bg-indigo-500/4 blur-[110px] pointer-events-none" />

      <div className="mx-auto max-w-7xl space-y-8 relative z-10">
        {/* Welcome Section & Member card Grid */}
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-stretch">
          {/* Welcome and Action Dashboard */}
          <Card className="flex flex-col justify-between overflow-hidden rounded-[24px] border-border/40 bg-card/65 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Crown className="h-4 w-4 shrink-0" />
                  {customer.tier} {copy.member}
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-[2.2rem] leading-none flex items-center gap-2">
                  {copy.welcome}, {customer.fullName}
                </h1>
                <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground max-w-xl">
                  {copy.intro}
                </p>
              </div>

              {/* Progress to next Membership level */}
              <div className="border-t border-border/50 pt-5">
                {customer.tier !== "Diamond" ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        Next Tier: <b className="text-foreground font-black">{nextTierName}</b>
                      </span>
                      <span className="text-primary font-black uppercase tracking-wider">
                        {pointsToNext.toLocaleString()} pts to go
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-accent/70 relative shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-blue-500 to-emerald-500 transition-all duration-700 shadow-[0_0_12px_rgba(0,102,255,0.45)]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>{tierBase.toLocaleString()} pts</span>
                      <span>{tierTarget.toLocaleString()} pts</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-800 font-bold">
                    <Crown className="h-4 w-4 shrink-0 text-emerald-600 animate-bounce" />
                    <span>Diamond Status secured! Maximum tier achieved. 💎</span>
                  </div>
                )}
              </div>

              {/* Quick Actions Shortcuts Grid */}
              <div className="border-t border-border/50 pt-5 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  {copy.quickActions}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Shortcut 1: Book Wash */}
                  <button
                    onClick={() => startSingleBooking()}
                    className="group flex flex-col justify-between p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground text-left shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10 active:scale-100"
                  >
                    <Plus className="h-6 w-6 opacity-90 transition-transform group-hover:rotate-90 duration-300" />
                    <span className="text-sm font-black mt-6 tracking-tight">{copy.book}</span>
                  </button>

                  {/* Shortcut 2: Vehicles */}
                  <Link
                    to="/customer/vehicles"
                    className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-background/80 text-foreground text-left shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/45 active:scale-100"
                  >
                    <CarFront className="h-6 w-6 text-primary" />
                    <div className="mt-4">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                        {copy.manageVehicles}
                      </div>
                      <div className="text-sm font-black mt-1 tracking-tight truncate">
                        {defaultVehicle ? defaultVehicle.licensePlate : copy.noVehicle}
                      </div>
                    </div>
                  </Link>

                  {/* Shortcut 3: History */}
                  <Link
                    to="/customer/history"
                    className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-background/80 text-foreground text-left shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/45 active:scale-100"
                  >
                    <History className="h-6 w-6 text-primary" />
                    <div className="mt-4">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                        {copy.activeBookings}
                      </div>
                      <div className="text-sm font-black mt-1 tracking-tight">
                        {activeBookingCount > 0 ? `${activeBookingCount} booked` : copy.history}
                      </div>
                    </div>
                  </Link>

                  {/* Shortcut 4: Loyalty Rewards */}
                  <Link
                    to="/customer/loyalty"
                    className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-background/80 text-foreground text-left shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/45 active:scale-100"
                  >
                    <Coins className="h-6 w-6 text-primary" />
                    <div className="mt-4">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                        {copy.available}
                      </div>
                      <div className="text-sm font-black mt-1 tracking-tight truncate">
                        {customer.availablePoints.toLocaleString()} PTS
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Premium Membership Card Visual and Intro video */}
          <Card className="flex flex-col justify-between items-center overflow-hidden rounded-[24px] border-border/40 bg-card/65 p-6 shadow-xl backdrop-blur-xl md:p-8 gap-6">
            {/* The Digital Membership Card stub */}
            <div
              className={cn(
                "w-full aspect-[1.586/1] rounded-2xl relative p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.03] cursor-default",
                tierDetails.cardBg,
              )}
            >
              {/* Card shimmer reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none -translate-x-full animate-shimmer" />

              <div className="flex justify-between items-start z-10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-black tracking-widest text-xs uppercase">
                    <Crown className="h-4 w-4" />
                    {copy.memberCardTitle}
                  </div>
                  <div className="text-[9px] tracking-widest opacity-80 font-black">
                    AURA CAR CARE
                  </div>
                </div>

                {/* Microchip icon layout */}
                <div className="h-7 w-10 rounded bg-gradient-to-br from-yellow-600 via-yellow-450 to-yellow-500 opacity-80 shadow-md flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-1 grid grid-cols-3 gap-0.5 border border-yellow-750/30 rounded opacity-65">
                    <div className="border-r border-b border-yellow-750/20"></div>
                    <div className="border-r border-b border-yellow-750/20"></div>
                    <div className="border-b border-yellow-750/20"></div>
                    <div className="border-r border-yellow-750/20"></div>
                    <div className="border-r border-yellow-750/20"></div>
                    <div className="grid grid-cols-2">
                      <div className="border-r border-yellow-750/20"></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name and Card Code */}
              <div className="my-2 space-y-0.5 z-10">
                <div className="text-xl font-black tracking-wide truncate max-w-full">
                  {customer.fullName}
                </div>
                <div className="font-mono text-xs opacity-80 tracking-widest">
                  •••• •••• •••• {customer.id.substring(customer.id.length - 4).toUpperCase()}
                </div>
              </div>

              {/* Card values metadata */}
              <div className="flex justify-between items-end border-t border-white/10 pt-3 z-10">
                <div>
                  <div className="text-[9px] uppercase opacity-75 leading-none font-bold">
                    {copy.available}
                  </div>
                  <div className="text-2xl font-black tracking-tight mt-0.5 flex items-baseline gap-1">
                    {customer.availablePoints.toLocaleString()}{" "}
                    <span className="text-[10px] font-bold">PTS</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase opacity-75 leading-none font-bold">
                    {copy.lifetime}
                  </div>
                  <div className="text-sm font-black mt-1">
                    {customer.lifetimePoints.toLocaleString()} PTS
                  </div>
                </div>
              </div>
            </div>

            {/* Video Clip Card */}
            <Card className="group relative w-full h-[140px] overflow-hidden rounded-xl border border-border/50 bg-slate-950 p-0 shadow-lg cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1600&auto=format&fit=crop"
                alt="Premium automatic car wash"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
              <button
                type="button"
                className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-xl backdrop-blur-md transition hover:scale-105"
                aria-label="Play introduction clip"
              >
                <PlayCircle className="h-6 w-6" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-yellow-300" /> {copy.aura}
                </div>
                <h3 className="mt-1 text-base font-black leading-none text-white drop-shadow">
                  {copy.clipTitle}
                </h3>
              </div>
            </Card>
          </Card>
        </section>

        {/* Live Wash Activity Tracker */}
        {trackedBooking || activeWashSession ? (
          <Card className="rounded-[24px] border-primary/25 bg-gradient-to-r from-primary/[0.04] via-emerald-500/[0.02] to-background/50 p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
            {/* Glowing left line */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-emerald-500" />

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pl-2">
              <div className="flex items-center gap-4 flex-1">
                {/* Real-time circular status indicator */}
                <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-emerald-500/20 bg-background text-lg font-black text-primary relative">
                  {trackerProgressPercent}%
                  <div className="absolute -inset-1 rounded-full border-2 border-emerald-500/40 animate-ping opacity-45 pointer-events-none" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 animate-pulse" />
                    {copy.activityTracker}
                  </div>
                  <h2 className="text-xl font-black tracking-tight mt-0.5 flex items-center gap-2 text-foreground">
                    {trackerVehiclePlate}
                    <span className="text-xs font-bold text-muted-foreground">
                      ({trackerServiceName})
                    </span>
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">
                    {copy.estimatedTime}:{" "}
                    <b className="text-foreground">{formatRemainingTime(remainingMs, language)}</b>
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="rounded-xl font-bold border-border/80 hover:bg-muted shrink-0 shadow-sm"
              >
                <Link to="/customer/history">{copy.viewDetails}</Link>
              </Button>
            </div>

            {/* Interactive Progress Line */}
            <div className="mt-8 mb-2 px-4">
              <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto">
                {/* Connector Lines */}
                <div className="absolute left-0 right-0 top-4 -translate-y-1/2 h-1 bg-muted/65 rounded-full z-0" />
                <div
                  className="absolute left-0 top-4 -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700 z-0"
                  style={{ width: `${trackerProgressPercent}%` }}
                />

                {/* Steps Mapping */}
                {washProgressSteps.map((step, idx) => {
                  return (
                    <div key={idx} className="flex flex-col items-center relative z-10">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300",
                          step.completed &&
                            !step.active &&
                            "bg-emerald-500 border-emerald-400 text-white",
                          step.active &&
                            "bg-primary border-primary-foreground text-white animate-pulse shadow-[0_0_12px_rgba(0,102,255,0.6)] scale-110",
                          !step.completed &&
                            !step.active &&
                            "bg-background border-border text-muted-foreground",
                        )}
                      >
                        {step.completed && !step.active ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.active ? (
                          <Droplets className="h-4 w-4 animate-bounce" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center whitespace-nowrap",
                          step.completed && !step.active && "text-emerald-600",
                          step.active && "text-primary font-black",
                          !step.completed && !step.active && "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ) : null}

        {/* Voucher Redemption Panel & Active Combo Grid */}
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
          {/* Coupon Redemption ticket layout */}
          <Card className="rounded-[24px] border-border/40 bg-card/65 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner shrink-0">
                  <Gift className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {copy.pointsVoucher}
                  </div>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-foreground">
                    {copy.generateVoucher}
                  </h2>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
                    {copy.pointsHint}
                  </p>
                </div>
              </div>

              {/* Point presets selection buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {copy.pointsPresetLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 150, 200].map((presetVal) => {
                    const isSelect = redeemPoints === presetVal;
                    return (
                      <button
                        key={presetVal}
                        type="button"
                        onClick={() => setRedeemPoints(presetVal)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-black border tracking-wider transition-all duration-200 active:scale-95",
                          isSelect
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                            : "bg-background/60 hover:bg-background border-border/70 text-foreground",
                        )}
                      >
                        {presetVal} pts
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout for Custom Points Input */}
              <div className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end pt-2">
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {copy.points}
                  </span>
                  <input
                    className="h-11 rounded-xl border border-border/70 bg-background/50 px-3 text-sm font-black outline-none ring-primary/20 transition focus:ring-4 focus:border-primary/50 text-foreground shadow-inner"
                    type="number"
                    min={50}
                    max={200}
                    step={10}
                    value={redeemPoints}
                    onChange={(event) => setRedeemPoints(Number(event.target.value))}
                  />
                </label>
                <div className="rounded-xl border border-border/75 bg-background/50 px-4 py-3 text-sm font-black text-primary text-center">
                  {(redeemPoints * 1000).toLocaleString()} VND
                </div>
                <Button
                  className="h-11 rounded-xl font-bold shadow-md shadow-primary/10 transition-transform active:scale-[0.98]"
                  onClick={redeemVoucher}
                >
                  {copy.generate}
                </Button>
              </div>

              {/* Visual Voucher Stub Graphic */}
              <div className="relative border border-dashed border-border/80 rounded-2xl bg-gradient-to-r from-background/90 via-background/45 to-primary/5 p-4 overflow-hidden shadow-inner flex justify-between items-center select-none mt-2">
                <div className="space-y-1 pr-6 z-10">
                  <div className="text-[9px] font-black uppercase tracking-widest text-primary/80">
                    {copy.voucherDiscountText}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-foreground leading-none">
                    -{(redeemPoints * 1000).toLocaleString()}{" "}
                    <span className="text-sm font-bold">VND</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 pt-1.5 leading-none">
                    <Clock className="h-3 w-3 text-muted-foreground" /> {copy.voucherExpiry}
                  </div>
                </div>

                {/* Visual tickets tear line */}
                <div className="absolute right-24 inset-y-0 flex flex-col justify-between items-center pointer-events-none z-10">
                  <div className="w-4 h-2 bg-card rounded-b-full border-b border-x border-border/40 -mt-[1px]" />
                  <div className="w-[1px] h-full border-r border-dashed border-border/60" />
                  <div className="w-4 h-2 bg-card rounded-t-full border-t border-x border-border/40 -mb-[1px]" />
                </div>

                {/* Code / Barcode visualization area */}
                <div className="w-20 flex flex-col items-center justify-center pl-2 z-10">
                  <div className="flex gap-[2px] opacity-25 h-7 mb-1 items-stretch">
                    <div className="w-[1px] bg-foreground"></div>
                    <div className="w-[2px] bg-foreground"></div>
                    <div className="w-[1px] bg-foreground"></div>
                    <div className="w-[1.5px] bg-foreground"></div>
                    <div className="w-[3px] bg-foreground"></div>
                    <div className="w-[1px] bg-foreground"></div>
                    <div className="w-[2px] bg-foreground"></div>
                  </div>
                  <div className="text-[10px] font-mono font-black text-muted-foreground tracking-tighter">
                    POINT{redeemPoints}K
                  </div>
                </div>
              </div>
            </div>

            {redeemMessage ? (
              <p className="mt-4 rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 border border-emerald-500/15">
                {redeemMessage}
              </p>
            ) : null}
          </Card>

          {/* Active Combo Credits Info */}
          <Card className="rounded-[24px] border-border/40 bg-card/65 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner shrink-0">
                    <Ticket className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      {copy.activeCombo}
                    </div>
                    <h2 className="mt-1 text-xl font-black tracking-tight">
                      {activeCombo?.comboName ?? copy.noCombo}
                    </h2>
                  </div>
                </div>
                {activeCombo ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-600">
                    {copy.statusActive}
                  </span>
                ) : null}
              </div>

              {activeCombo ? (
                <div className="space-y-4">
                  {/* Combo usages information */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-background/50 border border-border/60 rounded-xl p-3 shadow-inner">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Washes Remaining
                      </div>
                      <div className="text-xl font-black text-primary mt-1">
                        {activeCombo.remainingUses}{" "}
                        <span className="text-xs text-muted-foreground">
                          / {activeCombo.totalUses} left
                        </span>
                      </div>
                    </div>
                    <div className="bg-background/50 border border-border/60 rounded-xl p-3 shadow-inner">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Valid Until
                      </div>
                      <div className="text-sm font-black text-foreground mt-2 truncate">
                        {activeCombo.validUntil}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
                    Linked vehicle license plate:{" "}
                    <b className="text-foreground">{linkedVehicle?.licensePlate ?? "N/A"}</b>. Use
                    wash credits at checkout.
                  </p>

                  {/* QR Barcode Section toggle */}
                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBarcode(!showBarcode)}
                      className="h-10 w-full rounded-xl font-bold flex items-center justify-center gap-1.5 border-border/70 shadow-sm"
                    >
                      <QrCode className="h-4 w-4 text-primary" />
                      {showBarcode ? copy.hideBarcode : copy.viewBarcode}
                    </Button>

                    {showBarcode && (
                      <div className="p-4 border border-border/70 bg-white dark:bg-slate-900 rounded-xl shadow-inner flex flex-col items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Styled mock Barcode lines */}
                        <div className="flex items-center gap-[3px] min-h-[50px] w-full max-w-[280px] bg-white p-2 rounded">
                          {bars.map((char, idx) => (
                            <div
                              key={`${char}-${idx}`}
                              className={cn(
                                "h-10 bg-slate-950 rounded-[1px] flex-1",
                                idx % 3 === 0 && "h-11 w-1.5",
                                idx % 4 === 0 && "w-[3px]",
                                idx % 5 === 0 && "h-8",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                          {copy.scanAtCheckin}
                        </span>
                        <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-100">
                          {activeCombo.qrCodeText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                    {copy.buyCombo}
                  </p>
                </div>
              )}
            </div>

            {activeCombo ? (
              <Button
                className="mt-5 h-11 w-full rounded-xl font-bold shadow-md shadow-primary/10 transition-transform active:scale-[0.98]"
                disabled={activeCombo.remainingUses <= 0}
                onClick={startComboBooking}
              >
                {copy.bookCombo}
              </Button>
            ) : null}
          </Card>
        </section>

        {/* Wash plan Service Packages lists */}
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-primary">
                {copy.washPlan}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {copy.packagesTitle}
              </h2>
              <p className="text-sm font-medium text-muted-foreground">{copy.packagesText}</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl font-bold border-border/80 shadow-sm hover:bg-muted"
            >
              <Link to="/customer/bookings">{copy.openBooking}</Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {servicePackages.map((servicePackage) => (
              <Card
                key={servicePackage.id}
                className="group flex flex-col justify-between rounded-2xl border-border/40 bg-card/65 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/25"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
                      <Droplets className="h-5.5 w-5.5 transition-transform group-hover:scale-110 duration-300" />
                    </div>
                    {/* Visual recommended badge */}
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest border rounded-full px-2.5 py-1",
                        getPackageTagClass(servicePackage.id),
                      )}
                    >
                      {getPackageTag(servicePackage.id)}
                    </span>
                  </div>

                  <div className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
                    {servicePackage.recommendedFor}
                  </div>
                  <h3 className="mt-1 text-lg font-black text-foreground">{servicePackage.name}</h3>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-muted-foreground min-h-[38px]">
                    {servicePackage.description}
                  </p>

                  {/* Highlights section list with icons */}
                  <div className="border-t border-border/40 mt-4 pt-3.5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
                      {copy.featuresLabel}
                    </span>
                    <ul className="space-y-1.5">
                      {servicePackage.highlights?.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 space-y-4 pt-4 border-t border-border/40">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                        Price
                      </div>
                      <div className="font-black text-primary text-base mt-1">
                        {servicePackage.price.toLocaleString()} <span className="text-xs">VND</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                        Duration
                      </div>
                      <div className="text-xs font-bold text-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />{" "}
                        {servicePackage.durationMinutes} {copy.minutes}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="h-10 w-full rounded-xl font-bold shadow-md shadow-primary/5 transition-transform active:scale-[0.98]"
                    onClick={() => startSingleBooking(servicePackage.id)}
                  >
                    {copy.select}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Combo month upgrade Subscriptions */}
        <section className="space-y-5 pt-3">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-primary">
              {copy.comboPlans}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {copy.upgradeTitle}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">{copy.upgradeText}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {comboPackages.map((comboPackage) => {
              const isActive = comboPackage.id === activeCombo?.comboPackageId;
              const canUpgrade =
                Boolean(currentCombo) && comboPackage.price > (currentCombo?.price ?? 0);
              const upgradeAmount = currentCombo
                ? comboPackage.price - currentCombo.price
                : comboPackage.price;

              return (
                <Card
                  key={comboPackage.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border-border/40 bg-card/65 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl",
                    isActive &&
                      "border-primary/45 bg-primary/[0.03] shadow-md ring-1 ring-primary/20",
                    !isActive && !canUpgrade && "opacity-65 cursor-not-allowed",
                    !isActive && canUpgrade && "hover:border-primary/25",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase tracking-wider text-primary">
                        {comboPackage.totalUses} washes / {comboPackage.validityDays} days
                      </div>
                      {isActive && (
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-black text-primary uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-black text-foreground leading-tight">
                      {comboPackage.name}
                    </h3>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-muted-foreground min-h-[50px]">
                      {comboPackage.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/40 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                          Price
                        </div>
                        <div className="font-black text-foreground text-sm mt-1">
                          {comboPackage.price.toLocaleString()} <span className="text-xs">VND</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                          Savings
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-1">
                          {comboPackage.savingsText}
                        </div>
                      </div>
                    </div>

                    {canUpgrade ? (
                      <div className="text-[10px] font-bold text-muted-foreground leading-none pb-1 flex flex-col gap-1">
                        <span>{copy.upgradeAmountLabel}</span>
                        <span className="text-primary font-black text-xs">
                          +{upgradeAmount.toLocaleString()} VND
                        </span>
                      </div>
                    ) : null}

                    <Button
                      className={cn(
                        "h-10 w-full rounded-xl font-bold flex items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98]",
                        canUpgrade && "shadow-primary/5",
                        !canUpgrade && "cursor-not-allowed",
                      )}
                      variant={canUpgrade ? "default" : "secondary"}
                      disabled={!canUpgrade}
                      onClick={() => upgradeCombo(comboPackage.id)}
                    >
                      {!canUpgrade && !isActive ? (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          {copy.downgradeLocked}
                        </>
                      ) : isActive ? (
                        copy.activePlan
                      ) : (
                        copy.upgrade
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tracking-tight text-foreground">{value}</div>
    </div>
  );
}
