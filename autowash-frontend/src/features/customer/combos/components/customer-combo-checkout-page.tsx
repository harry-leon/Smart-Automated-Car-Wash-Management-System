"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Sparkles,
  Wallet,
  ShieldCheck,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  CarFront,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  BOOKING_TIME_SLOTS,
  formatBookingCurrency,
  formatLocalDateInput,
  getAvailableBookingTimeSlots,
  getPaymentMethodLabel,
} from "@/features/customer/bookings/lib/booking-format";
import { useActiveCustomerCombos, useBookingCombos, useCreateCustomerBooking, usePurchaseCustomerCombo } from "@/features/customer/bookings/hooks/use-bookings";
import { useCustomerVehicles } from "@/features/customer/vehicles/hooks/use-customer-vehicles";
import { cn } from "@/shared/lib/utils";
import type { BookingCombo, CustomerCombo, PaymentMethod } from "@/features/customer/bookings/booking.types";

type CustomerComboCheckoutPageProps = {
  comboId: string;
};

const PAYMENT_METHODS: PaymentMethod[] = ["BANK_TRANSFER", "E_WALLET", "CASH_AT_COUNTER"];

function buildComboHeroImage(combo: BookingCombo) {
  if (
    combo.image &&
    (combo.image.startsWith("/") || combo.image.startsWith("data:") || combo.image.startsWith("http"))
  ) {
    return combo.image;
  }

  const palettes = [
    { start: "#0f172a", end: "#1d4ed8", accent: "#38bdf8" },
    { start: "#111827", end: "#0f766e", accent: "#34d399" },
    { start: "#172554", end: "#7c3aed", accent: "#c084fc" },
    { start: "#3f1d0d", end: "#c2410c", accent: "#fb923c" },
    { start: "#1f2937", end: "#be123c", accent: "#fb7185" },
  ];
  const palette =
    palettes[
      Math.abs(combo.comboId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % palettes.length
    ];
  const safeTitle = combo.name;
  const safeSubtitle = `${combo.durationDays} ngày • ${combo.maxServices} lượt`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="100%" stop-color="${palette.end}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" rx="48" fill="url(#bg)" />
      <rect width="1200" height="800" fill="url(#glow)" />
      <circle cx="1010" cy="170" r="150" fill="#ffffff" fill-opacity="0.08" />
      <circle cx="180" cy="680" r="180" fill="#ffffff" fill-opacity="0.06" />
      <path d="M120 520 C240 350, 470 290, 690 350 S1030 520, 1110 470" stroke="#ffffff" stroke-opacity="0.18" stroke-width="18" fill="none" stroke-linecap="round"/>
      <text x="92" y="120" fill="#e0f2fe" font-size="28" font-family="Arial, sans-serif" font-weight="700" letter-spacing="6">AURA CAR CARE</text>
      <text x="92" y="452" fill="#ffffff" font-size="76" font-family="Arial, sans-serif" font-weight="800">${safeTitle}</text>
      <text x="92" y="515" fill="#dbeafe" font-size="30" font-family="Arial, sans-serif" font-weight="600">${safeSubtitle}</text>
      <rect x="92" y="574" width="240" height="58" rx="29" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.24"/>
      <text x="132" y="612" fill="#ffffff" font-size="24" font-family="Arial, sans-serif" font-weight="700">Premium combo</text>
    </svg>
  `.trim();

  if (typeof window === "undefined") {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  const encodedSvg = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encodedSvg}`;
}

export function CustomerComboCheckoutPage({ comboId }: CustomerComboCheckoutPageProps) {
  const router = useRouter();
  const combosQuery = useBookingCombos();
  const activeCombosQuery = useActiveCustomerCombos();
  const vehiclesQuery = useCustomerVehicles();
  const createBookingMutation = useCreateCustomerBooking();
  const purchaseComboMutation = usePurchaseCustomerCombo();
  const [vehicleId, setVehicleId] = useState("");
  const [bookingDate, setBookingDate] = useState(formatLocalDateInput(0));
  const [bookingTime, setBookingTime] = useState<string>(BOOKING_TIME_SLOTS[0] ?? "09:00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [showValidation, setShowValidation] = useState(false);

  const selectedCombo = useMemo(
    () => combosQuery.data?.find((combo) => combo.comboId === comboId) ?? null,
    [comboId, combosQuery.data],
  );
  const ownedCombo = useMemo(
    () =>
      activeCombosQuery.data?.find(
        (item) => item.comboId === comboId && Number(item.remainingUsages) > 0,
      ) ?? null,
    [activeCombosQuery.data, comboId],
  );
  const availableTimeSlots = useMemo(
    () => getAvailableBookingTimeSlots(bookingDate, BOOKING_TIME_SLOTS),
    [bookingDate],
  );
  const firstAvailableTimeSlot = availableTimeSlots.find((slot) => !slot.disabled)?.time ?? "";

  useEffect(() => {
    if (!bookingDate) {
      setBookingDate(formatLocalDateInput(0));
    }
  }, [bookingDate]);

  useEffect(() => {
    if (!firstAvailableTimeSlot) {
      return;
    }

    const selectedTimeSlot = availableTimeSlots.find((slot) => slot.time === bookingTime);
    if (!bookingTime || selectedTimeSlot?.disabled) {
      setBookingTime(firstAvailableTimeSlot);
    }
  }, [availableTimeSlots, bookingTime, firstAvailableTimeSlot]);

  if (combosQuery.isPending || activeCombosQuery.isPending || vehiclesQuery.isPending) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      </div>
    );
  }

  const error = combosQuery.error ?? activeCombosQuery.error ?? vehiclesQuery.error ?? null;
  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl border-rose-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle>Không tải được trang thanh toán combo</CardTitle>
            <CardDescription>{getDisplayErrorMessage(error)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/customer/home">Về trang chủ</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/combos">Xem danh sách combo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedCombo) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle>Combo không tồn tại</CardTitle>
            <CardDescription>Vui lòng quay lại danh sách combo để chọn gói khác.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/customer/home">Về trang chủ</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/combos">Xem combo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const combo = selectedCombo as BookingCombo & { services?: string[] };
  const originalPrice = combo.upgradePriceFrom && combo.upgradePriceFrom > combo.basePrice
    ? combo.upgradePriceFrom
    : combo.basePrice;
  const savings = Math.max(0, originalPrice - combo.basePrice);
  const comboBenefits = combo.benefits ?? combo.services ?? [];
  const heroImageSrc = buildComboHeroImage(combo);
  const vehicles = vehiclesQuery.data?.items ?? [];
  const selectedVehicle = vehicles.find((item) => item.vehicleId === vehicleId) ?? null;
  const demoVisualBenefits = [
    "Khoang nội thất sạch sâu, hoàn thiện nhanh",
    "Bề mặt sơn bóng hơn sau mỗi lần dùng",
    "Phù hợp khách hàng đi xe thường xuyên trong tháng",
  ];
  const paymentMethods = [
    {
      label: "Chuyển khoản ngân hàng",
      note: "Xác nhận tự động sau khi nối cổng thanh toán",
    },
    {
      label: "Ví điện tử",
      note: "Dùng cho luồng QR hoặc ví liên kết ở giai đoạn sau",
    },
    {
      label: "Thanh toán tại quầy",
      note: "Nhân viên xác nhận gói trực tiếp tại cửa hàng",
    },
  ];

  if (!vehicleId && vehicles.length > 0) {
    const nextVehicleId = vehicles.find((item) => item.isPrimary)?.vehicleId ?? vehicles[0]?.vehicleId ?? "";
    if (nextVehicleId) {
      setTimeout(() => setVehicleId(nextVehicleId), 0);
    }
  }

  const fieldErrors = {
    vehicleId: !vehicleId ? "Vui lòng chọn xe." : null,
    bookingDate: !bookingDate ? "Vui lòng chọn ngày đặt lịch." : null,
    bookingTime: !bookingTime ? "Vui lòng chọn giờ đặt lịch." : null,
    paymentMethod: !paymentMethod ? "Vui lòng chọn phương thức thanh toán." : null,
  };

  const handleConfirm = async () => {
    setShowValidation(true);

    if (!ownedCombo && fieldErrors.paymentMethod) {
      toast.error("Thiếu thông tin thanh toán combo.");
      return;
    }

    if (
      ownedCombo &&
      (fieldErrors.vehicleId || fieldErrors.bookingDate || fieldErrors.bookingTime || fieldErrors.paymentMethod)
    ) {
      toast.error("Thiếu thông tin đặt lịch cho combo.");
      return;
    }

    try {
      if (ownedCombo) {
        const booking = await createBookingMutation.mutateAsync({
          mode: "COMBO",
          vehicleId,
          packageId: "",
          comboId: combo.comboId,
          addonIds: [],
          bookingDate,
          bookingTime,
          voucherCode: "",
          paymentMethod,
        });

        toast.success("Đã dùng combo sẵn có và tạo lịch thành công.");
        router.push(`/customer/bookings/success?bookingId=${booking.bookingId}&otpExpiresAt=${encodeURIComponent(booking.otpExpiresAt)}`);
        return;
      }

      await purchaseComboMutation.mutateAsync({
        comboId: combo.comboId,
        paymentMethod,
      });

      toast.success("Đã mua combo thành công. Bạn có thể dùng gói này để đặt lịch ngay bây giờ.");
      router.push("/customer/home");
    } catch (submitError) {
      toast.error(getDisplayErrorMessage(submitError));
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Combo checkout
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Thanh toán combo
            </h1>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/customer/home">Quay lại trang chủ</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(37,99,235,0.18),rgba(255,255,255,0.92))] px-6 py-6 sm:px-8">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div>
                  <Badge className="rounded-full bg-white/85 text-sky-700 hover:bg-white/85">
                    Gói combo nổi bật
                  </Badge>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    {combo.name}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    {combo.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-sky-200 bg-white/80 text-sky-700">
                      {combo.durationDays} ngày sử dụng
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-sky-200 bg-white/80 text-sky-700">
                      Tối đa {combo.maxServices} lượt
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-sky-200 bg-white/80 text-sky-700">
                      {combo.isActive ? "Đang mở bán" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur">
                  <div className="relative h-56 overflow-hidden rounded-[1.25rem] bg-slate-900">
                    <img
                      src={heroImageSrc}
                      alt={combo.name}
                      className="h-full w-full object-cover opacity-90 transition-opacity duration-300 hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                    
                    <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                      Visual riêng cho gói
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200 drop-shadow-md">
                          Aura Car Care
                        </div>
                        <div className="mt-1 text-2xl font-black tracking-tight text-white drop-shadow-lg">
                          {combo.name}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 p-2.5 shadow-lg backdrop-blur-md">
                        <img src="/logo.png" alt="Aura Car Care" className="h-9 w-9 rounded-xl drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {demoVisualBenefits.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white bg-white/90 px-3 py-3 text-xs font-medium leading-5 text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <InfoBox
                  icon={Clock3}
                  label="Thời hạn"
                  value={`${combo.durationDays} ngày`}
                  helper={`${combo.maxServices} lượt tối đa`}
                />
                <InfoBox
                  icon={ShieldCheck}
                  label="Trạng thái"
                  value={combo.isActive ? "Đang mở bán" : "Tạm dừng"}
                  helper={combo.canUpgrade ? "Có thể nâng cấp" : "Không nâng cấp"}
                />
                <InfoBox
                  icon={Wallet}
                  label="Tiết kiệm"
                  value={formatBookingCurrency(savings)}
                  helper="So với giá gốc"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    <BadgeCheck className="h-4 w-4 text-sky-700" />
                    Quyền lợi trong gói
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {comboBenefits.length > 0 ? (
                      comboBenefits.map((benefit) => (
                        <div
                          key={benefit}
                          className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="text-sm leading-6 text-slate-700">{benefit}</span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">
                        Chưa có danh sách quyền lợi chi tiết.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    <CarFront className="h-4 w-4 text-sky-700" />
                    Mô tả trải nghiệm
                  </div>
                  <div className="mt-4 space-y-3">
                    <DetailRow label="Combo ID" value={combo.comboId} mono />
                    <DetailRow label="Loại gói" value="Combo chăm xe định kỳ" />
                    <DetailRow label="Mức ưu đãi" value={formatBookingCurrency(savings)} />
                    <DetailRow label="Phù hợp" value="Khách hàng muốn tối ưu chi phí nhiều lần rửa" />
                  </div>

                  <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Star className="h-4 w-4 text-amber-500" />
                      Ghi chú sử dụng
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Gói này phù hợp để dùng liên tục trong thời gian ngắn. Bạn có thể theo dõi lượt còn lại
                      và ngày hết hạn trực tiếp tại trang chủ khách hàng sau khi mua thành công.
                    </p>
                  </div>
                </div>
              </div>

              {ownedCombo ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                  <div className="font-bold">Bạn đã có combo này</div>
                  <div className="mt-1">
                    Còn {ownedCombo.remainingUsages} lượt, hết hạn vào{" "}
                    {new Date(ownedCombo.expiresAt).toLocaleDateString("vi-VN")}.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
                  Khi xác nhận thanh toán, hệ thống sẽ gọi backend
                  <span className="mx-1 font-mono">POST /customers/combos/{comboId}/activate</span>
                  để mua combo độc lập. Sau khi mua xong, gói sẽ xuất hiện ở trang chủ để bạn dùng cho booking kế tiếp.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Thanh toán combo</CardTitle>
              <CardDescription>Thông tin tổng quan, phương thức dự kiến và trạng thái xử lý hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Giá gốc
                    </div>
                    <div className="text-sm font-semibold text-slate-400 line-through">
                      {formatBookingCurrency(originalPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Giá combo
                    </div>
                    <div className="text-3xl font-black tracking-tight text-sky-700">
                      {formatBookingCurrency(combo.basePrice)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm font-semibold text-slate-600">Tiết kiệm ngay</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    {formatBookingCurrency(savings)}
                  </span>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                  <CreditCard className="h-4 w-4 text-sky-700" />
                  Phương thức thanh toán
                </div>
                <div className="mt-3 grid gap-3">
                  {paymentMethods.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          DEMO
                        </span>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                  {ownedCombo ? "Thông tin tạo booking" : "Thông tin thanh toán combo"}
                </div>

                <div className="mt-4 space-y-4">
                  {ownedCombo ? (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Xe sử dụng</label>
                        <select
                          value={vehicleId}
                          onChange={(event) => setVehicleId(event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900"
                        >
                          <option value="">Chọn xe của bạn</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                              {vehicle.plate} · {vehicle.brand} {vehicle.model}
                            </option>
                          ))}
                        </select>
                        {showValidation && fieldErrors.vehicleId ? (
                          <p className="mt-2 text-sm text-rose-600">{fieldErrors.vehicleId}</p>
                        ) : null}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Ngày đặt lịch</label>
                          <input
                            type="date"
                            min={formatLocalDateInput(0)}
                            value={bookingDate}
                            onChange={(event) => setBookingDate(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900"
                          />
                          {showValidation && fieldErrors.bookingDate ? (
                            <p className="mt-2 text-sm text-rose-600">{fieldErrors.bookingDate}</p>
                          ) : null}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Khung giờ</label>
                          <select
                            value={bookingTime}
                            onChange={(event) => setBookingTime(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900"
                          >
                            {availableTimeSlots.map(({ time, disabled }) => (
                              <option key={time} value={time} disabled={disabled}>
                                {time}
                              </option>
                            ))}
                          </select>
                          {availableTimeSlots.every((slot) => slot.disabled) ? (
                            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                              No time slots are available for today. Please choose a later date.
                            </p>
                          ) : null}
                          {showValidation && fieldErrors.bookingTime ? (
                            <p className="mt-2 text-sm text-rose-600">{fieldErrors.bookingTime}</p>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Phương thức thanh toán</label>
                    <div className="grid gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const active = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-left transition",
                              active
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-800 hover:border-slate-400",
                            )}
                          >
                            <div className="font-semibold">{getPaymentMethodLabel(method)}</div>
                            <div className={cn("mt-1 text-xs", active ? "text-slate-200" : "text-slate-500")}>
                              Dùng payload booking thật để backend xử lý mua combo / áp lượt còn lại.
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-600">
                    {ownedCombo ? (
                      selectedVehicle ? (
                        <>
                          Booking sẽ tạo cho xe <span className="font-semibold text-slate-900">{selectedVehicle.plate}</span>
                          {" "}vào ngày <span className="font-semibold text-slate-900">{bookingDate || "--"}</span>
                          {" "}lúc <span className="font-semibold text-slate-900">{bookingTime || "--"}</span>.
                        </>
                      ) : (
                        <>Chọn xe, ngày và giờ để tạo booking combo thật qua backend.</>
                      )
                    ) : (
                      <>
                        Sau khi thanh toán thành công, combo sẽ được kích hoạt ngay với{" "}
                        <span className="font-semibold text-slate-900">{combo.maxServices} lượt</span> và thời hạn{" "}
                        <span className="font-semibold text-slate-900">{combo.durationDays} ngày</span>.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {Boolean(createBookingMutation.isError || purchaseComboMutation.isError) ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getDisplayErrorMessage(createBookingMutation.error ?? purchaseComboMutation.error ?? null)}
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  className="h-12 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleConfirm}
                  disabled={
                    createBookingMutation.isPending ||
                    purchaseComboMutation.isPending ||
                    combo.isActive === false ||
                    Boolean(ownedCombo && vehicles.length === 0)
                  }
                >
                  {createBookingMutation.isPending || purchaseComboMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {ownedCombo ? "Đang tạo booking combo" : "Đang thanh toán combo"}
                    </>
                  ) : (
                    <>
                      {ownedCombo ? "Dùng combo và tạo lịch" : "Mua combo ngay"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full">
                  <Link href="/customer/combos">Chọn combo khác</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
          <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{helper}</div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className={cn("text-right text-sm font-semibold text-slate-900", mono && "font-mono text-xs sm:text-sm")}>
        {value}
      </div>
    </div>
  );
}
