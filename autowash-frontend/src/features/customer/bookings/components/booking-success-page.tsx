"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  Car,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  ArrowRight,
  Clock3,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  formatBookingCurrency,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/features/customer/bookings/lib/booking-format";
import {
  useCustomerBookingDetail,
  useResendBookingOtp,
  useVerifyBookingOtp,
} from "@/features/customer/bookings/hooks/use-bookings";
import { useCustomerProfile } from "@/features/customer/profile/hooks/use-customer-profile";

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

export function CustomerBookingSuccessPage({
  bookingId,
  initialOtpExpiresAt = null,
}: {
  bookingId: string;
  initialOtpExpiresAt?: string | null;
}) {
  const bookingQuery = useCustomerBookingDetail(bookingId);
  const profileQuery = useCustomerProfile();
  const resendOtpMutation = useResendBookingOtp(bookingId);
  const verifyOtpMutation = useVerifyBookingOtp(bookingId);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [localOtpExpiresAt, setLocalOtpExpiresAt] = useState<string | null>(initialOtpExpiresAt);
  const otpExpiresAt = localOtpExpiresAt ?? bookingQuery.data?.confirmationExpiresAt ?? null;
  const otpSecondsLeft = useOtpSecondsLeft(otpExpiresAt);
  const bookingStatus = bookingQuery.data?.status ?? null;
  const confirmationStatus = bookingQuery.data?.confirmationStatus ?? null;
  const needsOtpVerification = bookingStatus === "PENDING" && confirmationStatus === "PENDING";
  const bookingResolved =
    bookingStatus !== null && !needsOtpVerification && bookingStatus !== "PENDING";
  const otpExpired = Boolean(otpExpiresAt && otpSecondsLeft === 0);

  useEffect(() => {
    const serverExpiresAt = bookingQuery.data?.confirmationExpiresAt ?? null;
    if (!serverExpiresAt) {
      return;
    }

    if (
      !localOtpExpiresAt ||
      new Date(serverExpiresAt).getTime() >= new Date(localOtpExpiresAt).getTime()
    ) {
      setLocalOtpExpiresAt(serverExpiresAt);
    }
  }, [bookingQuery.data?.confirmationExpiresAt, localOtpExpiresAt]);

  useEffect(() => {
    if (initialOtpExpiresAt) {
      setLocalOtpExpiresAt(initialOtpExpiresAt);
    }
  }, [initialOtpExpiresAt]);

  useEffect(() => {
    if (bookingResolved) {
      setOtpError(null);
      setOtpCode("");
    }
  }, [bookingResolved]);

  useEffect(() => {
    if (!needsOtpVerification) {
      return;
    }

    const timer = window.setInterval(() => {
      void bookingQuery.refetch();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [bookingQuery, needsOtpVerification]);

  if (!bookingId) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl border-rose-200 bg-white">
          <CardHeader>
            <CardTitle>Missing booking reference</CardTitle>
            <CardDescription>No booking ID was provided for the success page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/customer/bookings/new">Create a booking</Link>
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
            <CardTitle>Unable to load booking success details</CardTitle>
            <CardDescription>
              {bookingQuery.isError
                ? getDisplayErrorMessage(bookingQuery.error)
                : "Booking not found."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/customer/home">Go home</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/bookings/new">Create another booking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = bookingQuery.data;
  const customerName = booking.customerName || profileQuery.data?.fullName || "Customer";
  const customerPhone = booking.customerPhone || profileQuery.data?.phone || "No phone number";
  const customerEmail = profileQuery.data?.email || "customer@example.com";

  const formattedPlacedDate = new Date(booking.createdAt || Date.now()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const formattedExpectedDate = new Date(booking.scheduling.bookingDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
  const progressSteps = [
    {
      number: 1,
      title: needsOtpVerification ? "WAITING FOR OTP" : "BOOKING CONFIRMED",
      subtitle: needsOtpVerification ? "Pending verification" : "Scheduled",
      active: true,
    },
    { number: 2, title: "CHECKED IN", subtitle: "Vehicle at bay", active: false },
    { number: 3, title: "WASHING", subtitle: "In progress", active: false },
    { number: 4, title: "QUALITY CHECK", subtitle: "Inspection", active: false },
    { number: 5, title: "COMPLETED", subtitle: "Ready for pickup", active: false },
  ];

  const handleResendOtp = async () => {
    if (!needsOtpVerification || bookingResolved) {
      setOtpError("Booking already confirmed.");
      toast.error("Booking already confirmed.");
      await bookingQuery.refetch();
      return;
    }

    try {
      const response = await resendOtpMutation.mutateAsync();
      setLocalOtpExpiresAt(response.expiresAt);
      setOtpCode("");
      setOtpError(null);
      await bookingQuery.refetch();
      toast.success("A new booking OTP was sent to your email.");
    } catch (error) {
      setOtpError(getDisplayErrorMessage(error));
      toast.error(getDisplayErrorMessage(error));
    }
  };

  const handleVerifyOtp = async () => {
    if (!needsOtpVerification || bookingResolved) {
      setOtpError("Booking already confirmed.");
      toast.error("Booking already confirmed.");
      await bookingQuery.refetch();
      return;
    }

    if (otpExpired) {
      setOtpError("OTP expired. Resend a new OTP before verifying.");
      toast.error("OTP expired. Resend a new OTP before verifying.");
      await bookingQuery.refetch();
      return;
    }

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      {/* Navigation / Header mimic from image, simple and clean */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-6">
          <span className="text-xl font-black tracking-wider text-slate-800">AUTOWASH</span>
          <div className="hidden space-x-4 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:flex">
            <span>Services</span>
            <span>Combos</span>
            <span>Promotions</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span>{customerName}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Area - Green Box & Stepper Progress (Spans 2 columns on large screens) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Green Hero Section */}
          <div
            className={`relative overflow-hidden rounded-3xl ${needsOtpVerification ? "bg-sky-600" : "bg-[#2ecc71]"} px-6 py-12 text-center text-white shadow-lg`}
          >
            {/* Decorative floating shapes in background */}
            <div className="absolute top-10 left-10 h-3 w-3 rounded-full bg-white/20 animate-ping" />
            <div className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-white/10" />

            <div className="flex flex-col items-center justify-center">
              {/* Floating animated checkmark circle with confetti */}
              <div
                className={`relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white ${needsOtpVerification ? "text-sky-600" : "text-[#2ecc71]"} shadow-xl transition-transform hover:scale-105`}
              >
                {needsOtpVerification ? (
                  <Clock3 className="h-12 w-12" />
                ) : (
                  <Check className="h-12 w-12 stroke-[4]" />
                )}
                {/* Confetti details */}
                <span className="absolute -top-3 -left-3 animate-pulse text-amber-300 text-xl">
                  ✦
                </span>
                <span className="absolute -top-6 right-2 text-violet-200 text-sm">◆</span>
                <span className="absolute top-2 -right-6 text-pink-300 text-sm">●</span>
                <span className="absolute bottom-2 -left-6 text-sky-200 text-md">▲</span>
                <span className="absolute -bottom-4 left-4 text-emerald-100 text-xl">★</span>
                <span className="absolute bottom-6 -right-4 text-yellow-300 text-xs">■</span>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">
                {needsOtpVerification ? "Verification Required" : "Thank You"}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-wide uppercase sm:text-3xl">
                {needsOtpVerification ? "Verify Your Booking" : "Your Booking is Confirmed"}
              </h1>
              <p className="mt-4 max-w-md text-sm text-emerald-50 text-center leading-relaxed">
                {needsOtpVerification ? (
                  <>
                    Your booking is pending. Enter the 6-digit OTP sent to{" "}
                    <span className="font-semibold underline">{customerEmail}</span> to confirm it.
                  </>
                ) : (
                  <>
                    We have confirmed your booking and sent a confirmation email to{" "}
                    <span className="font-semibold underline">{customerEmail}</span>.
                  </>
                )}
              </p>
            </div>
          </div>

          {needsOtpVerification ? (
            <Card className="border-sky-200 bg-sky-50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3 text-sky-800">
                  <Clock3 className="h-5 w-5" />
                  <CardTitle>Email OTP required</CardTitle>
                </div>
                <CardDescription>
                  The booking is saved as pending. It will only become confirmed after OTP
                  verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm font-medium text-sky-800">
                  Expires in {formatOtpCountdown(otpSecondsLeft)}. Resend is limited to 3 times per
                  hour.
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
                    disabled={verifyOtpMutation.isPending || resendOtpMutation.isPending || otpExpired}
                  >
                    {verifyOtpMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
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
                {booking.devOtp && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="font-semibold">Development Hint:</span> Your OTP code is{" "}
                    <span className="font-mono font-bold text-lg select-all bg-white px-2 py-0.5 rounded border border-amber-300">
                      {booking.devOtp}
                    </span>
                  </div>
                )}
                {otpError ? <p className="text-sm text-rose-600">{otpError}</p> : null}
                {otpExpired ? (
                  <p className="text-sm text-amber-700">OTP expired. Resend a new OTP before verifying.</p>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 bg-emerald-50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3 text-emerald-800">
                  <Check className="h-5 w-5" />
                  <CardTitle>Booking already confirmed</CardTitle>
                </div>
                <CardDescription>
                  This booking no longer needs OTP verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-emerald-900">
                <p>The OTP flow is closed because the booking is no longer pending.</p>
                <p className="font-medium">
                  Current status: {bookingStatus ? bookingStatus.replaceAll("_", " ") : "UNKNOWN"}
                  {confirmationStatus ? ` · Verification: ${confirmationStatus.replaceAll("_", " ")}` : ""}
                </p>
                <Button type="button" variant="outline" onClick={() => void bookingQuery.refetch()}>
                  Refresh from server
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Progress / Status Panel */}
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <CardContent className="space-y-7 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-slate-950">
                    Booking{" "}
                    <span className="font-mono text-emerald-600">
                      #{booking.confirmationNumber}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Placed on{" "}
                    <span className="font-semibold text-slate-800">{formattedPlacedDate}</span>.{" "}
                    {needsOtpVerification
                      ? "Email OTP verification is still required."
                      : "Your schedule is confirmed and pending check-in."}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    needsOtpVerification
                      ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      needsOtpVerification ? "bg-sky-500" : "bg-emerald-500"
                    }`}
                  />
                  {needsOtpVerification ? "Verification pending" : "Confirmed"}
                </span>
              </div>

              <div className="relative rounded-2xl bg-slate-50/70 px-4 py-6 sm:px-6">
                <div className="absolute left-[10%] right-[10%] top-12 hidden h-0.5 rounded-full bg-slate-200 md:block" />
                <div className="grid gap-5 md:grid-cols-5">
                  {progressSteps.map((step) => (
                    <div
                      key={step.number}
                      className="relative z-10 flex min-h-[112px] flex-col items-center text-center"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm transition-all ${
                          step.active
                            ? needsOtpVerification
                              ? "border-sky-500 bg-sky-500 text-white shadow-sky-100"
                              : "border-emerald-500 bg-emerald-500 text-white shadow-emerald-100"
                            : "border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {step.number === 1 ? (
                          needsOtpVerification ? (
                            <Clock3 className="h-5 w-5" />
                          ) : (
                            <Check className="h-5 w-5 stroke-[3]" />
                          )
                        ) : (
                          step.number
                        )}
                      </div>
                      <div
                        className={`mt-3 max-w-[130px] text-xs font-extrabold leading-4 ${
                          step.active ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div
                        className={`mt-1 text-[11px] font-medium leading-4 ${
                          step.active
                            ? needsOtpVerification
                              ? "text-sky-600"
                              : "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {step.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Expected wash time
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {formattedExpectedDate} at {booking.scheduling.bookingTime}
                  </div>
                </div>
                <Link
                  href={`/customer/bookings/${booking.bookingId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
                >
                  Track Your Booking <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild className="rounded-xl px-5 py-2.5 font-semibold">
              <Link href={`/customer/bookings/${booking.bookingId}`}>View Booking Detail</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl px-5 py-2.5 font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Link href="/customer/bookings">Back to Bookings List</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-xl text-slate-500 hover:text-slate-700 font-semibold"
            >
              <Link href="/customer/bookings/new">Book Another Service</Link>
            </Button>
          </div>
        </div>

        {/* Right Column - Sidebar Order Details */}
        <div>
          <Card className="border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden divide-y divide-slate-100">
            {/* Header Panel */}
            <div className="p-6 bg-slate-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Order Detail
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    #{booking.confirmationNumber}
                  </h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                >
                  <Download className="h-3 w-3" />
                  <span>Receipt</span>
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 pt-3">
                <span>Method: {getPaymentMethodLabel(booking.payment.method)}</span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 uppercase tracking-wide">
                  {getPaymentStatusLabel(booking.payment.status)}
                </span>
              </div>
            </div>

            {/* Vehicle Section */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Car className="h-4 w-4 text-slate-400" />
                <span>Vehicle Details</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">
                  {booking.vehicleBrand} {booking.vehicleModel}
                </h4>
                <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">
                  Plate: {booking.vehiclePlate}
                </p>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Schedule Details</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">
                    {booking.scheduling.bookingDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-semibold text-slate-800">
                    {booking.scheduling.bookingTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {booking.scheduling.estimatedDuration} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <User className="h-4 w-4 text-slate-400" />
                <span>Contact Details</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-slate-800">{customerName}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />
                  <span>{customerPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="h-3 w-3" />
                  <span>{customerEmail}</span>
                </div>
              </div>
            </div>

            {/* Order Summary Pricing Section */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>Order Summary</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{booking.packageName}</span>
                  <span className="font-semibold text-slate-800">
                    {formatBookingCurrency(booking.pricing.basePrice)}
                  </span>
                </div>

                {booking.addons && booking.addons.length > 0 && (
                  <div className="pl-3 border-l border-slate-100 space-y-1">
                    {booking.addons.map((addon) => (
                      <div
                        key={addon.addonId}
                        className="flex justify-between text-xs text-slate-400"
                      >
                        <span>+ {addon.addonName}</span>
                        <span>{formatBookingCurrency(addon.addonPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatBookingCurrency(booking.pricing.subtotal)}</span>
                </div>

                {booking.pricing.voucherDiscount > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-red-500">
                    <span>Voucher Discount</span>
                    <span>-{formatBookingCurrency(booking.pricing.voucherDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                  <span>Total</span>
                  <span>{formatBookingCurrency(booking.pricing.finalAmount)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
