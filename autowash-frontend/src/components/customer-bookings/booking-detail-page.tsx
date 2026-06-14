"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  RefreshCcw,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import {
  formatBookingCurrency,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  humanizeCode,
} from "@/lib/booking-format";
import {
  useCancelCustomerBooking,
  useCustomerBookingDetail,
  useResendBookingOtp,
  useVerifyBookingOtp,
} from "@/hooks/use-bookings";
import { useCustomerProfile } from "@/hooks/use-customer-profile";
import { ApplyPointsPanel } from "@/components/customer-bookings/apply-points-panel";

function formatShortDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatOtpCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function useOtpSecondsLeft(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }

    const update = () => {
      setSecondsLeft(Math.max(Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000), 0));
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return secondsLeft;
}

export function CustomerBookingDetailPage({ bookingId }: { bookingId: string }) {
  const bookingQuery = useCustomerBookingDetail(bookingId);
  const profileQuery = useCustomerProfile();
  const cancelBookingMutation = useCancelCustomerBooking(bookingId);
  const resendOtpMutation = useResendBookingOtp(bookingId);
  const verifyOtpMutation = useVerifyBookingOtp(bookingId);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [localOtpExpiresAt, setLocalOtpExpiresAt] = useState<string | null>(null);

  const otpExpiresAt = localOtpExpiresAt ?? bookingQuery.data?.confirmationExpiresAt ?? null;
  const otpSecondsLeft = useOtpSecondsLeft(otpExpiresAt);

  useEffect(() => {
    const serverExpiresAt = bookingQuery.data?.confirmationExpiresAt ?? null;
    if (!serverExpiresAt) {
      return;
    }

    if (!localOtpExpiresAt || new Date(serverExpiresAt).getTime() >= new Date(localOtpExpiresAt).getTime()) {
      setLocalOtpExpiresAt(serverExpiresAt);
    }
  }, [bookingQuery.data?.confirmationExpiresAt, localOtpExpiresAt]);

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
            <CardTitle>Unable to load booking details</CardTitle>
            <CardDescription>
              {bookingQuery.isError ? getDisplayErrorMessage(bookingQuery.error) : "Booking not found."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/customer/home">Go home</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/bookings/new">Create a booking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = bookingQuery.data;
  const needsOtpVerification =
    booking.status === "PENDING" && booking.confirmationStatus === "PENDING";
  const canCancelBooking = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const customerName = booking.customerName || profileQuery.data?.fullName || "Customer";
  const customerPhone = booking.customerPhone || profileQuery.data?.phone || "No phone number";
  const customerEmail = profileQuery.data?.email || "customer@example.com";
  const expectedDate = formatShortDate(booking.scheduling.bookingDate);
  const expectedTime = booking.scheduling.bookingTime.length >= 5
    ? booking.scheduling.bookingTime.slice(0, 5)
    : booking.scheduling.bookingTime;

  let heroBg = "bg-emerald-600";
  let heroTitle = "Your booking is confirmed";
  let heroDesc = `We have received your booking for ${expectedDate} at ${expectedTime}.`;
  let heroIcon = <CheckCircle2 className="h-12 w-12" />;

  if (needsOtpVerification) {
    heroBg = "bg-sky-600";
    heroTitle = "Verify your booking";
    heroDesc = "Enter the email OTP to confirm this booking before the confirmation window expires.";
    heroIcon = <Clock3 className="h-12 w-12" />;
  } else if (booking.status === "CANCELLED") {
    heroBg = "bg-rose-600";
    heroTitle = "Booking cancelled";
    heroDesc = "This booking has been cancelled.";
    heroIcon = <XCircle className="h-12 w-12" />;
  } else if (booking.status === "COMPLETED" || booking.washStatus === "COMPLETED") {
    heroBg = "bg-emerald-700";
    heroTitle = "Wash session completed";
    heroDesc = "Your vehicle has been washed, inspected, and picked up.";
    heroIcon = <CheckCircle2 className="h-12 w-12" />;
  } else if (booking.status === "NO_SHOW") {
    heroBg = "bg-slate-600";
    heroTitle = "No show";
    heroDesc = "The booking was marked as no-show.";
    heroIcon = <AlertCircle className="h-12 w-12" />;
  } else if (booking.status === "CHECKED_IN" || booking.washStatus) {
    heroBg = "bg-blue-600";
    heroTitle = humanizeCode(booking.washStatus ?? booking.status);
    heroDesc = "Track the current wash progress from this booking detail.";
    heroIcon = <Car className="h-12 w-12" />;
  }

  const handleResendOtp = async () => {
    try {
      const response = await resendOtpMutation.mutateAsync();
      setLocalOtpExpiresAt(response.expiresAt);
      setOtpCode("");
      setOtpError(null);
      await bookingQuery.refetch();
      toast.success("A new OTP was sent to your email.");
    } catch (error) {
      setOtpError(getDisplayErrorMessage(error));
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode)) {
      setOtpError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync(otpCode);
      setLocalOtpExpiresAt(null);
      setOtpCode("");
      setOtpError(null);
      await bookingQuery.refetch();
      toast.success("Booking verified successfully.");
    } catch (error) {
      setOtpError(getDisplayErrorMessage(error));
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBookingMutation.mutateAsync(cancelReason.trim() || undefined);
      toast.success("Booking cancelled successfully.");
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
                Booking #{booking.confirmationNumber}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
                {heroTitle}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90">{heroDesc}</p>
            </div>
          </div>

          {needsOtpVerification ? (
            <Card className="border-sky-200 bg-sky-50 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3 text-sky-800">
                  <Clock3 className="h-5 w-5" />
                  <CardTitle>Email OTP required</CardTitle>
                </div>
                <CardDescription>
                  Enter the 6-digit OTP sent to your email. Resend is limited to 3 times per hour.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm font-medium text-sky-800">
                  Expires in {formatOtpCountdown(otpSecondsLeft)}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(event) => {
                      setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                      setOtpError(null);
                    }}
                    placeholder="6-digit OTP"
                    className="min-h-11 flex-1 rounded-xl border border-sky-200 bg-white px-3 py-2 text-center text-lg font-bold text-slate-900"
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyOtpMutation.isPending || resendOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify booking
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={resendOtpMutation.isPending || verifyOtpMutation.isPending}
                  >
                    {resendOtpMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="mr-2 h-4 w-4" />
                    )}
                    Resend OTP
                  </Button>
                </div>
                {otpError ? <p className="text-sm text-rose-600">{otpError}</p> : null}
                {otpSecondsLeft === 0 ? (
                  <p className="text-sm text-amber-700">This OTP has expired. Resend a new OTP before verifying.</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200 bg-white shadow-md">
            <CardHeader>
              <CardTitle>Booking timeline</CardTitle>
              <CardDescription>Status and schedule for this wash session.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Expected date" value={expectedDate} />
              <InfoRow icon={<Clock3 className="h-4 w-4" />} label="Expected time" value={expectedTime} />
              <InfoRow icon={<Car className="h-4 w-4" />} label="Booking status" value={humanizeCode(booking.status)} />
              <InfoRow icon={<FileText className="h-4 w-4" />} label="Verification" value={humanizeCode(booking.confirmationStatus)} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <DetailSection
              title="Customer and vehicle"
              rows={[
                ["Customer", customerName],
                ["Phone", customerPhone],
                ["Email", customerEmail],
                ["Vehicle", `${booking.vehicleBrand} ${booking.vehicleModel}`],
                ["Plate", booking.vehiclePlate],
                ["Service", booking.packageName ?? "--"],
              ]}
            />
            <DetailSection
              title="Schedule and payment"
              rows={[
                ["Booking date", booking.scheduling.bookingDate],
                ["Booking time", booking.scheduling.bookingTime],
                ["Estimated end", booking.scheduling.estimatedEndTime],
                ["Payment method", getPaymentMethodLabel(booking.payment.method)],
                ["Payment status", getPaymentStatusLabel(booking.payment.status)],
                ["Transaction", booking.payment.transactionId || "--"],
              ]}
            />
          </div>

          <ApplyPointsPanel
            bookingId={booking.bookingId}
            finalAmount={booking.pricing.finalAmount}
            pointsRedeemed={booking.pricing.pointsRedeemed}
            pointsDiscount={booking.pricing.pointsDiscount}
            disabled={booking.status !== "CONFIRMED"}
            language="en"
          />
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
            <CardHeader className="bg-slate-50">
              <CardDescription>Order detail</CardDescription>
              <CardTitle>#{booking.confirmationNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <SidebarBlock icon={<Car className="h-4 w-4" />} title="Vehicle details">
                <p className="font-semibold text-slate-800">
                  {booking.vehicleBrand} {booking.vehicleModel}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Plate: {booking.vehiclePlate}
                </p>
              </SidebarBlock>

              <SidebarBlock icon={<User className="h-4 w-4" />} title="Contact details">
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

              <SidebarBlock icon={<FileText className="h-4 w-4" />} title="Order summary">
                <SummaryLine label={booking.packageName ?? "Service"} value={formatBookingCurrency(booking.pricing.basePrice)} />
                {booking.addons.map((addon) => (
                  <SummaryLine
                    key={addon.addonId}
                    label={`+ ${addon.addonName}`}
                    value={formatBookingCurrency(addon.addonPrice)}
                    muted
                  />
                ))}
                <SummaryLine label="Subtotal" value={formatBookingCurrency(booking.pricing.subtotal)} muted />
                {booking.pricing.voucherDiscount > 0 ? (
                  <SummaryLine label="Voucher discount" value={`-${formatBookingCurrency(booking.pricing.voucherDiscount)}`} muted />
                ) : null}
                {booking.pricing.pointsDiscount > 0 ? (
                  <SummaryLine label="Points discount" value={`-${formatBookingCurrency(booking.pricing.pointsDiscount)}`} muted />
                ) : null}
                <SummaryLine label="Total" value={formatBookingCurrency(booking.pricing.finalAmount)} strong />
              </SidebarBlock>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-md">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/customer/bookings">Back to bookings</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/customer/bookings/new">Book another service</Link>
              </Button>
              {canCancelBooking ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => setShowCancelForm((value) => !value)}
                  >
                    Cancel booking
                  </Button>
                  {showCancelForm ? (
                    <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-3">
                      <textarea
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        placeholder="Cancel reason"
                        className="min-h-24 w-full rounded-xl border border-rose-100 bg-white p-3 text-sm outline-none"
                      />
                      <Button
                        type="button"
                        className="w-full bg-rose-600 hover:bg-rose-700"
                        onClick={handleCancelBooking}
                        disabled={cancelBookingMutation.isPending}
                      >
                        {cancelBookingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm cancel
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
