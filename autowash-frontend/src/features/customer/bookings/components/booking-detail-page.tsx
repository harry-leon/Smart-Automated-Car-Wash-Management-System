"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  formatBookingCurrency,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  humanizeCode,
} from "@/features/customer/bookings/lib/booking-format";
import {
  useCancelCustomerBooking,
  useCustomerBookingDetail,
} from "@/features/customer/bookings/hooks/use-bookings";
import { useCustomerProfile } from "@/features/customer/profile/hooks/use-customer-profile";
import { ApplyPointsPanel } from "@/features/customer/bookings/components/apply-points-panel";
import type { BookingAddonSelection, BookingDetail } from "@/features/customer/bookings/booking.types";
import { useLanguageStore, translate } from "@/shared/store/language.store";

function formatShortDate(date: string, lang: "vi" | "en") {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getBookingOptions(booking: BookingDetail): BookingAddonSelection[] {
  return booking.addons ?? booking.options ?? [];
}

export function CustomerBookingDetailPage({ bookingId }: { bookingId: string }) {
  const { language } = useLanguageStore();
  const bookingQuery = useCustomerBookingDetail(bookingId);
  const profileQuery = useCustomerProfile();
  const cancelBookingMutation = useCancelCustomerBooking(bookingId);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (bookingQuery.isPending) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-3xl border border-slate-200 bg-white p-10">
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
            <CardTitle>{translate("Không thể tải chi tiết lịch đặt", "Unable to load booking details", language)}</CardTitle>
            <CardDescription>
              {bookingQuery.isError
                ? getDisplayErrorMessage(bookingQuery.error)
                : translate("Không tìm thấy lịch đặt.", "Booking not found.", language)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/customer/home">{translate("Về trang chủ", "Go home", language)}</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/bookings/new">{translate("Tạo lịch đặt", "Create a booking", language)}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = bookingQuery.data;
  const bookingOptions = getBookingOptions(booking);
  const canCancelBooking = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const customerName = booking.customerName || profileQuery.data?.fullName || translate("Khách hàng", "Customer", language);
  const customerPhone = booking.customerPhone || profileQuery.data?.phone || translate("Chưa có số điện thoại", "No phone number", language);
  const customerEmail = profileQuery.data?.email || translate("email của bạn", "your email", language);
  const expectedDate = formatShortDate(booking.scheduling.bookingDate, language);
  const expectedTime = booking.scheduling.bookingTime.length >= 5
    ? booking.scheduling.bookingTime.slice(0, 5)
    : booking.scheduling.bookingTime;

  let heroBg = "bg-emerald-600";
  let heroTitle = translate("Lịch đặt đã được tạo", "Booking created", language);
  let heroDesc = translate(
    `Chúng tôi đã nhận lịch đặt của bạn vào ngày ${expectedDate} lúc ${expectedTime}. Email xác nhận đã được gửi đến ${customerEmail}.`,
    `We have received your booking for ${expectedDate} at ${expectedTime}. A confirmation email was sent to ${customerEmail}.`,
    language,
  );
  let heroIcon = <CheckCircle2 className="h-12 w-12" />;

  if (booking.status === "CANCELLED") {
    heroBg = "bg-rose-600";
    heroTitle = translate("Lịch đặt đã bị huỷ", "Booking cancelled", language);
    heroDesc = translate("Lịch đặt này đã bị huỷ.", "This booking has been cancelled.", language);
    heroIcon = <XCircle className="h-12 w-12" />;
  } else if (booking.status === "COMPLETED" || booking.washStatus === "COMPLETED") {
    heroBg = "bg-emerald-700";
    heroTitle = translate("Đã hoàn thành rửa xe", "Wash session completed", language);
    heroDesc = translate("Xe của bạn đã được rửa, kiểm tra và bàn giao.", "Your vehicle has been washed, inspected, and picked up.", language);
    heroIcon = <CheckCircle2 className="h-12 w-12" />;
  } else if (booking.status === "NO_SHOW") {
    heroBg = "bg-slate-600";
    heroTitle = translate("Vắng mặt", "No show", language);
    heroDesc = translate("Lịch đặt đã được đánh dấu là vắng mặt.", "The booking was marked as no-show.", language);
    heroIcon = <AlertCircle className="h-12 w-12" />;
  } else if (booking.status === "CHECKED_IN" || booking.washStatus) {
    heroBg = "bg-blue-600";
    heroTitle = humanizeCode(booking.washStatus ?? booking.status);
    heroDesc = translate("Theo dõi tiến trình rửa xe từ trang chi tiết này.", "Track the current wash progress from this booking detail.", language);
    heroIcon = <Car className="h-12 w-12" />;
  }

  const handleCancelBooking = async () => {
    try {
      await cancelBookingMutation.mutateAsync(cancelReason.trim() || undefined);
      toast.success(translate("Đã huỷ lịch đặt thành công.", "Booking cancelled successfully.", language));
      setShowCancelForm(false);
      setCancelReason("");
    } catch (error) {
      toast.error(getDisplayErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`relative overflow-hidden rounded-3xl ${heroBg} px-6 py-12 text-white shadow-lg`}>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-xl">
                {heroIcon}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">
                {translate("Lịch đặt", "Booking", language)} #{booking.confirmationNumber}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
                {heroTitle}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90">{heroDesc}</p>
            </div>
          </div>

          <Card className="border-emerald-200 bg-emerald-50 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3 text-emerald-800">
                <Mail className="h-5 w-5" />
                <CardTitle>{translate("Email xác nhận lịch đặt", "Booking confirmation email", language)}</CardTitle>
              </div>
              <CardDescription>
                {translate("Email xác nhận có tóm tắt lịch đặt và lịch hẹn.", "The confirmation email contains the booking summary and schedule.", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => void bookingQuery.refetch()}>
                {translate("Tải lại từ máy chủ", "Refresh from server", language)}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-md">
            <CardHeader>
              <CardTitle>{translate("Lịch trình lịch đặt", "Booking timeline", language)}</CardTitle>
              <CardDescription>{translate("Trạng thái và lịch hẹn cho lần rửa xe này.", "Status and schedule for this wash session.", language)}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={<Calendar className="h-4 w-4" />} label={translate("Ngày hẹn", "Expected date", language)} value={expectedDate} />
              <InfoRow icon={<Clock3 className="h-4 w-4" />} label={translate("Giờ hẹn", "Expected time", language)} value={expectedTime} />
              <InfoRow icon={<Car className="h-4 w-4" />} label={translate("Trạng thái lịch đặt", "Booking status", language)} value={humanizeCode(booking.status)} />
              <InfoRow icon={<FileText className="h-4 w-4" />} label={translate("Xác nhận", "Confirmation", language)} value={humanizeCode(booking.confirmationStatus)} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <DetailSection
              title={translate("Khách hàng và xe", "Customer and vehicle", language)}
              rows={[
                [translate("Khách hàng", "Customer", language), customerName],
                [translate("Điện thoại", "Phone", language), customerPhone],
                [translate("Email", "Email", language), customerEmail],
                [translate("Xe", "Vehicle", language), `${booking.vehicleBrand} ${booking.vehicleModel}`],
                [translate("Biển số", "Plate", language), booking.vehiclePlate],
                [translate("Dịch vụ", "Service", language), booking.packageName ?? "--"],
              ]}
            />
            <DetailSection
              title={translate("Lịch hẹn và thanh toán", "Schedule and payment", language)}
              rows={[
                [translate("Ngày đặt", "Booking date", language), booking.scheduling.bookingDate],
                [translate("Giờ đặt", "Booking time", language), booking.scheduling.bookingTime],
                [translate("Dự kiến kết thúc", "Estimated end", language), booking.scheduling.estimatedEndTime],
                [translate("Phương thức TT", "Payment method", language), getPaymentMethodLabel(booking.payment.method)],
                [translate("Trạng thái TT", "Payment status", language), getPaymentStatusLabel(booking.payment.status)],
                [translate("Mã giao dịch", "Transaction", language), booking.payment.transactionId || "--"],
              ]}
            />
          </div>

          <ApplyPointsPanel
            bookingId={booking.bookingId}
            finalAmount={booking.pricing.finalAmount}
            pointsRedeemed={booking.pricing.pointsRedeemed}
            pointsDiscount={booking.pricing.pointsDiscount}
            disabled={booking.status !== "CONFIRMED"}
            language={language}
          />
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
            <CardHeader className="bg-slate-50">
              <CardDescription>{translate("Chi tiết đơn hàng", "Order detail", language)}</CardDescription>
              <CardTitle>#{booking.confirmationNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <SidebarBlock icon={<Car className="h-4 w-4" />} title={translate("Thông tin xe", "Vehicle details", language)}>
                <p className="font-semibold text-slate-800">
                  {booking.vehicleBrand} {booking.vehicleModel}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  {translate("Biển số", "Plate", language)}: {booking.vehiclePlate}
                </p>
              </SidebarBlock>

              <SidebarBlock icon={<User className="h-4 w-4" />} title={translate("Thông tin liên hệ", "Contact details", language)}>
                <p className="font-semibold text-slate-800">{customerName}</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />
                  {customerPhone}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="h-3 w-3" />
                  {customerEmail}
                </p>
              </SidebarBlock>

              <SidebarBlock icon={<FileText className="h-4 w-4" />} title={translate("Tóm tắt đơn hàng", "Order summary", language)}>
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
                  <SummaryLine label={translate("Giảm giá voucher", "Voucher discount", language)} value={`-${formatBookingCurrency(booking.pricing.voucherDiscount)}`} muted />
                ) : null}
                {booking.pricing.pointsDiscount > 0 ? (
                  <SummaryLine label={translate("Giảm điểm", "Points discount", language)} value={`-${formatBookingCurrency(booking.pricing.pointsDiscount)}`} muted />
                ) : null}
                <SummaryLine label={translate("Tổng cộng", "Total", language)} value={formatBookingCurrency(booking.pricing.finalAmount)} strong />
              </SidebarBlock>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-md">
            <CardHeader>
              <CardTitle>{translate("Thao tác", "Actions", language)}</CardTitle>
              <CardDescription>{translate("Quản lý lịch đặt này.", "Manage this booking.", language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/customer/bookings">{translate("Quay lại danh sách", "Back to bookings", language)}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/customer/bookings/new">{translate("Đặt dịch vụ khác", "Book another service", language)}</Link>
              </Button>
              {canCancelBooking ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => setShowCancelForm((value) => !value)}
                  >
                    {translate("Huỷ lịch đặt", "Cancel booking", language)}
                  </Button>
                  {showCancelForm ? (
                    <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-3">
                      <textarea
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        placeholder={translate("Lý do huỷ", "Cancel reason", language)}
                        className="min-h-24 w-full rounded-xl border border-rose-100 bg-white p-3 text-sm outline-none"
                      />
                      <Button
                        type="button"
                        className="w-full bg-rose-600 hover:bg-rose-700"
                        onClick={handleCancelBooking}
                        disabled={cancelBookingMutation.isPending}
                      >
                        {cancelBookingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {translate("Xác nhận huỷ", "Confirm cancel", language)}
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{icon}</span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function DetailSection({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Card className="border-slate-200 bg-white shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([label, value]) => (
          <SummaryLine key={label} label={label} value={value} />
        ))}
      </CardContent>
    </Card>
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
