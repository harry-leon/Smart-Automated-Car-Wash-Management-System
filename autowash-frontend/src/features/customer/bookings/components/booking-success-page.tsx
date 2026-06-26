"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Car,
  Check,
  Download,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  formatBookingCurrency,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  humanizeCode,
} from "@/features/customer/bookings/lib/booking-format";
import { useCustomerBookingDetail } from "@/features/customer/bookings/hooks/use-bookings";
import { useCustomerProfile } from "@/features/customer/profile/hooks/use-customer-profile";
import type { BookingAddonSelection, BookingDetail } from "@/features/customer/bookings/booking.types";
import { useLanguageStore, translate } from "@/shared/store/language.store";

function getBookingOptions(booking: BookingDetail): BookingAddonSelection[] {
  return booking.addons ?? booking.options ?? [];
}

function formatDisplayDate(value: string, locale: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function CustomerBookingSuccessPage({ bookingId }: { bookingId: string }) {
  const { language } = useLanguageStore();
  const bookingQuery = useCustomerBookingDetail(bookingId);
  const profileQuery = useCustomerProfile();
  const locale = language === "vi" ? "vi-VN" : "en-US";

  if (!bookingId) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl border-rose-200 bg-white">
          <CardHeader>
            <CardTitle>{translate("Thiếu mã đặt lịch", "Missing booking reference", language)}</CardTitle>
            <CardDescription>{translate("Không có mã đặt lịch nào được cung cấp.", "No booking ID was provided for the success page.", language)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/customer/bookings/new">{translate("Tạo đặt lịch", "Create a booking", language)}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingQuery.isPending) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-center rounded-3xl border border-slate-200 bg-white p-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      </div>
    );
  }

  if (bookingQuery.isError || !bookingQuery.data) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl border-rose-200 bg-white">
          <CardHeader>
            <CardTitle>{translate("Không thể tải thông tin đặt lịch", "Unable to load booking success details", language)}</CardTitle>
            <CardDescription>
              {bookingQuery.isError ? getDisplayErrorMessage(bookingQuery.error) : translate("Không tìm thấy đặt lịch.", "Booking not found.", language)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/customer/home">{translate("Về trang chủ", "Go home", language)}</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/bookings/new">{translate("Tạo đặt lịch mới", "Create another booking", language)}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = bookingQuery.data;
  const bookingOptions = getBookingOptions(booking);
  const customerName = booking.customerName || profileQuery.data?.fullName || translate("Khách hàng", "Customer", language);
  const customerPhone = booking.customerPhone || profileQuery.data?.phone || translate("Chưa có số điện thoại", "No phone number", language);
  const customerEmail = profileQuery.data?.email || translate("email của bạn", "your email", language);
  const placedDate = new Date(booking.createdAt || Date.now()).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const expectedDate = formatDisplayDate(booking.scheduling.bookingDate, locale);

  const progressSteps = [
    { number: 1, title: translate("ĐẶT LỊCH THÀNH CÔNG", "BOOKING CREATED", language), subtitle: translate("Email đã gửi", "Email sent", language), active: true },
    { number: 2, title: translate("ĐÃ NHẬN XE", "CHECKED IN", language), subtitle: translate("Xe tại vịnh rửa", "Vehicle at bay", language), active: false },
    { number: 3, title: translate("ĐANG RỬA", "WASHING", language), subtitle: translate("Đang thực hiện", "In progress", language), active: false },
    { number: 4, title: translate("KIỂM TRA CHẤT LƯỢNG", "QUALITY CHECK", language), subtitle: translate("Kiểm tra", "Inspection", language), active: false },
    { number: 5, title: translate("HOÀN THÀNH", "COMPLETED", language), subtitle: translate("Sẵn sàng nhận xe", "Ready for pickup", language), active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-black tracking-wider text-slate-800">AUTOWASH</span>
            <div className="hidden space-x-4 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:flex">
              <span>{translate("Dịch vụ", "Services", language)}</span>
              <span>{translate("Combo", "Combos", language)}</span>
              <span>{translate("Khuyến mãi", "Promotions", language)}</span>
            </div>
          </div>
          <span className="text-sm font-medium text-slate-600">{customerName}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl bg-emerald-600 px-6 py-12 text-center text-white shadow-lg">
              <div className="absolute left-10 top-10 h-3 w-3 rounded-full bg-white/20" />
              <div className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-white/10" />
              <div className="flex flex-col items-center justify-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-emerald-600 shadow-xl">
                  <Check className="h-12 w-12 stroke-[4]" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">{translate("Cảm ơn bạn", "Thank You", language)}</p>
                <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
                  {translate("Đặt lịch thành công!", "Booking Created Successfully", language)}
                </h1>
                <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-emerald-50">
                  {translate(
                    <>Chúng tôi đã gửi email xác nhận đến <span className="font-semibold underline">{customerEmail}</span>. Vui lòng kiểm tra hộp thư.</>,
                    <>We sent a confirmation email to <span className="font-semibold underline">{customerEmail}</span>. Please check your inbox for the booking details.</>,
                    language,
                  )}
                </p>
              </div>
            </div>

            <Card className="border-emerald-200 bg-emerald-50 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3 text-emerald-800">
                  <Mail className="h-5 w-5" />
                  <CardTitle>{translate("Email xác nhận đã gửi", "Confirmation email sent", language)}</CardTitle>
                </div>
                <CardDescription>
                  {translate("Đặt lịch đã được lưu và sẵn sàng để nhận xe vào thời gian đã hẹn.", "Your booking is saved and ready for check-in at the scheduled time.", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => void bookingQuery.refetch()}>
                  {translate("Làm mới đặt lịch", "Refresh booking", language)}
                </Button>
                <Button asChild>
                  <Link href={`/customer/bookings/${booking.bookingId}`}>{translate("Xem chi tiết đặt lịch", "View booking detail", language)}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-7 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold leading-7 text-slate-950">
                      {translate("Đặt lịch", "Booking")} <span className="font-mono text-emerald-600">#{booking.confirmationNumber}</span>
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {translate("Tạo vào", "Placed on", language)} <span className="font-semibold text-slate-800">{placedDate}</span>. {translate("Trạng thái:", "Status:", language)}{" "}
                      <span className="font-semibold text-slate-800">{humanizeCode(booking.status)}</span>.
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {translate("Xác nhận qua email", "Email confirmation", language)}
                  </span>
                </div>

                <div className="relative rounded-2xl bg-slate-50/70 px-4 py-6 sm:px-6">
                  <div className="absolute left-[10%] right-[10%] top-12 hidden h-0.5 rounded-full bg-slate-200 md:block" />
                  <div className="grid gap-5 md:grid-cols-5">
                    {progressSteps.map((step) => (
                      <div key={step.number} className="relative z-10 flex min-h-[112px] flex-col items-center text-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm ${
                            step.active
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-emerald-100"
                              : "border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {step.number === 1 ? <Check className="h-5 w-5 stroke-[3]" /> : step.number}
                        </div>
                        <div className={`mt-3 max-w-[130px] text-xs font-extrabold leading-4 ${step.active ? "text-slate-900" : "text-slate-400"}`}>
                          {step.title}
                        </div>
                        <div className={`mt-1 text-[11px] font-medium leading-4 ${step.active ? "text-emerald-600" : "text-slate-400"}`}>
                          {step.subtitle}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {translate("Thời gian rửa dự kiến", "Expected wash time", language)}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {expectedDate} {translate("lúc", "at", language)} {booking.scheduling.bookingTime}
                    </div>
                  </div>
                  <Link
                    href={`/customer/bookings/${booking.bookingId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 transition hover:border-sky-200 hover:bg-sky-100"
                  >
                    {translate("Theo dõi đặt lịch", "Track Your Booking", language)} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild className="rounded-xl px-5 py-2.5 font-semibold">
                <Link href={`/customer/bookings/${booking.bookingId}`}>{translate("Xem chi tiết đặt lịch", "View Booking Detail", language)}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">
                <Link href="/customer/bookings">{translate("Danh sách đặt lịch", "Back to Bookings List", language)}</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-xl font-semibold text-slate-500 hover:text-slate-700">
                <Link href="/customer/bookings/new">{translate("Đặt dịch vụ khác", "Book Another Service", language)}</Link>
              </Button>
            </div>
          </div>

          <div>
            <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-md">
              <div className="border-b border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {translate("Chi tiết đơn hàng", "Order Detail", language)}
                    </span>
                    <h2 className="mt-0.5 text-xl font-extrabold text-slate-900">#{booking.confirmationNumber}</h2>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <Download className="h-3 w-3" />
                    <span>{translate("Biên lai", "Receipt", language)}</span>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs text-slate-500">
                  <span>{translate("Phương thức", "Method", language)}: {getPaymentMethodLabel(booking.payment.method)}</span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wide text-emerald-700">
                    {getPaymentStatusLabel(booking.payment.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <SidebarBlock icon={<Car className="h-4 w-4" />} title={translate("Thông tin xe", "Vehicle Details", language)}>
                  <h4 className="text-sm font-bold text-slate-800">
                    {booking.vehicleBrand} {booking.vehicleModel}
                  </h4>
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    {translate("Biển số", "Plate", language)}: {booking.vehiclePlate}
                  </p>
                </SidebarBlock>

                <SidebarBlock icon={<Calendar className="h-4 w-4" />} title={translate("Chi tiết lịch hẹn", "Schedule Details", language)}>
                  <DetailLine label={translate("Ngày", "Date", language)} value={booking.scheduling.bookingDate} />
                  <DetailLine label={translate("Khung giờ", "Time Window", language)} value={booking.scheduling.bookingTime} />
                  <DetailLine label={translate("Thời lượng ước tính", "Est. Duration", language)} value={`${booking.scheduling.estimatedDuration} ${translate("phút", "mins", language)}`} />
                </SidebarBlock>

                <SidebarBlock icon={<User className="h-4 w-4" />} title={translate("Thông tin liên hệ", "Contact Details", language)}>
                  <div className="font-semibold text-slate-800">{customerName}</div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3 w-3" />
                    {customerPhone}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    {customerEmail}
                  </p>
                </SidebarBlock>

                <SidebarBlock icon={<FileText className="h-4 w-4" />} title={translate("Tóm tắt đơn hàng", "Order Summary", language)}>
                  <SummaryLine label={booking.packageName ?? translate("Dịch vụ", "Service", language)} value={formatBookingCurrency(booking.pricing.basePrice)} />
                  {bookingOptions.map((addon) => (
                    <SummaryLine
                      key={addon.addonId}
                      label={`+ ${addon.addonName}`}
                      value={formatBookingCurrency(addon.addonPrice)}
                      muted
                    />
                  ))}
                  <SummaryLine label={translate("Tạm tính", "Subtotal", language)} value={formatBookingCurrency(booking.pricing.subtotal)} muted />
                  {booking.pricing.voucherDiscount > 0 ? (
                    <SummaryLine label={translate("Giảm voucher", "Voucher Discount", language)} value={`-${formatBookingCurrency(booking.pricing.voucherDiscount)}`} muted />
                  ) : null}
                  <SummaryLine label={translate("Tổng cộng", "Total", language)} value={formatBookingCurrency(booking.pricing.finalAmount)} strong />
                </SidebarBlock>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  muted = false,
  strong = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        strong ? "border-t border-slate-200 pt-3 text-base font-extrabold" : "text-sm"
      } ${muted ? "text-slate-500" : "text-slate-800"}`}
    >
      <span>{label}</span>
      <span className={strong ? "text-slate-900" : "font-semibold text-slate-800"}>{value}</span>
    </div>
  );
}
