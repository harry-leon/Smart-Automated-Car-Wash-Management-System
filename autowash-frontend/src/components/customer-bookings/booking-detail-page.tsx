"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Check, Car, Calendar, User, Mail, Phone, FileText, Download, ArrowRight, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { formatBookingCurrency, getPaymentMethodLabel, getPaymentStatusLabel } from "@/lib/booking-format";
import { useCancelCustomerBooking, useCustomerBookingDetail } from "@/hooks/use-bookings";
import { useCustomerProfile } from "@/hooks/use-customer-profile";

function buildLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time.length >= 5 ? time.slice(0, 5) : time}`);
}

function formatClockLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function formatCountdown(target: Date) {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) {
    return "now";
  }

  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function CustomerBookingDetailPage({ bookingId }: { bookingId: string }) {
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
  const canCancelBooking = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const customerName = booking.customerName || profileQuery.data?.fullName || "Customer";
  const customerPhone = booking.customerPhone || profileQuery.data?.phone || "No phone number";
  const customerEmail = profileQuery.data?.email || "customer@example.com";

  const formattedPlacedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(booking.createdAt || Date.now()));

  const [scheduleYear, scheduleMonth, scheduleDay] = booking.scheduling.bookingDate.split("-").map(Number);
  const formattedExpectedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(scheduleYear, scheduleMonth - 1, scheduleDay)));
  const formattedExpectedTime = booking.scheduling.bookingTime.length >= 5
    ? booking.scheduling.bookingTime.slice(0, 5)
    : booking.scheduling.bookingTime;
  const scheduledStartAt = buildLocalDateTime(booking.scheduling.bookingDate, booking.scheduling.bookingTime);
  const estimatedDurationMinutes = booking.scheduling.estimatedDuration;
  const washStartAt = new Date(scheduledStartAt.getTime() + 15 * 60000);
  const qualityCheckAt = new Date(scheduledStartAt.getTime() + Math.max(estimatedDurationMinutes - 8, 10) * 60000);
  const completionAt = new Date(scheduledStartAt.getTime() + estimatedDurationMinutes * 60000);

  // Calculate active step in timeline (1 to 5)
  let activeStep = 1;
  if (booking.status === "COMPLETED" || booking.washStatus === "COMPLETED") {
    activeStep = 5;
  } else if (booking.washStatus === "QUALITY_CHECK") {
    activeStep = 4;
  } else if (booking.washStatus === "WASHING" || booking.washStatus === "IN_PROGRESS") {
    activeStep = 3;
  } else if (booking.status === "CHECKED_IN" || (booking.washStatus && booking.washStatus !== "NOT_STARTED")) {
    activeStep = 2;
  }
  const progressPercentage = ((activeStep - 1) / 4) * 100;
  const isCompletedBooking = booking.status === "COMPLETED" || booking.washStatus === "COMPLETED";
  const countdownTarget =
    isCompletedBooking || activeStep >= 4
      ? completionAt
      : activeStep === 3
        ? qualityCheckAt
        : washStartAt;
  const countdownLabel = isCompletedBooking
    ? "Completed"
    : activeStep >= 4
      ? "Completion in"
      : activeStep === 3
        ? "Quality check in"
        : "Wash starts in";
  const countdownValue = isCompletedBooking ? `Done at ${formatClockLabel(completionAt)}` : formatCountdown(countdownTarget);
  const timelineSteps = [
    {
      index: 1,
      title: "Booking confirmed",
      time: formatClockLabel(new Date(booking.createdAt || Date.now())),
      note: "Scheduled",
    },
    {
      index: 2,
      title: "Checked in",
      time: formatClockLabel(scheduledStartAt),
      note: "Vehicle at bay",
    },
    {
      index: 3,
      title: "Washing",
      time: formatClockLabel(washStartAt),
      note: `Starts in ${formatCountdown(washStartAt)}`,
    },
    {
      index: 4,
      title: "Quality check",
      time: formatClockLabel(qualityCheckAt),
      note: "Final inspection",
    },
    {
      index: 5,
      title: "Completed",
      time: formatClockLabel(completionAt),
      note: isCompletedBooking ? "Finished" : `ETA ${formatClockLabel(completionAt)}`,
    },
  ] as const;

  // Hero Banner styles based on status
  let heroBg = "bg-[#2ecc71]"; // Green (default / confirmed)
  let heroTitle = "Your Booking is Confirmed";
  let heroDesc = `We have received your booking and it is scheduled for ${formattedExpectedDate} at ${formattedExpectedTime}.`;
  let heroIcon = <Check className="h-12 w-12 stroke-[4]" />;

  if (booking.status === "CANCELLED") {
    heroBg = "bg-rose-600";
    heroTitle = "Booking Cancelled";
    heroDesc = "This booking has been cancelled. If points or pre-payment were applied, they have been refunded.";
    heroIcon = <XCircle className="h-12 w-12" />;
  } else if (booking.status === "NO_SHOW") {
    heroBg = "bg-slate-600";
    heroTitle = "No Show";
    heroDesc = "You did not check in for this booking at the scheduled time.";
    heroIcon = <AlertCircle className="h-12 w-12" />;
  } else if (booking.status === "COMPLETED" || booking.washStatus === "COMPLETED") {
    heroBg = "bg-emerald-600";
    heroTitle = "Wash Session Completed";
    heroDesc = "Your vehicle has been successfully washed, inspected, and picked up. Thank you!";
    heroIcon = <CheckCircle2 className="h-12 w-12" />;
  } else if (booking.washStatus === "QUALITY_CHECK") {
    heroBg = "bg-indigo-600";
    heroTitle = "Quality Checking";
    heroDesc = "The washing is done! Our staff is performing a final quality inspection of your vehicle.";
    heroIcon = <Loader2 className="h-12 w-12 animate-spin" />;
  } else if (booking.washStatus === "WASHING" || booking.washStatus === "IN_PROGRESS") {
    heroBg = "bg-sky-600";
    heroTitle = "Vehicle is Being Washed";
    heroDesc = "Your vehicle is currently in the wash bay. You can check the live tracking details.";
    heroIcon = <Loader2 className="h-12 w-12 animate-spin" />;
  } else if (booking.status === "CHECKED_IN") {
    heroBg = "bg-blue-600";
    heroTitle = "Checked In";
    heroDesc = "Your vehicle has arrived at the bay and is currently queued for washing.";
    heroIcon = <Car className="h-12 w-12" />;
  }

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Area - Dynamic Hero Box, Stepper Progress, and Apply Points Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dynamic Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl ${heroBg} px-6 py-12 text-center text-white shadow-lg`}>
            <div className="absolute top-10 left-10 h-3 w-3 rounded-full bg-white/20 animate-ping" />
            <div className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-white/10" />

            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition-transform hover:scale-105">
                <div className={`text-current ${heroBg.includes("rose") ? "text-rose-600" : heroBg.includes("slate") ? "text-slate-600" : heroBg.includes("indigo") ? "text-indigo-600" : heroBg.includes("sky") ? "text-sky-600" : heroBg.includes("blue") ? "text-blue-600" : "text-[#2ecc71]"}`}>
                  {heroIcon}
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-90">Booking Status</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-wide uppercase sm:text-3xl">
                {heroTitle}
              </h1>
              <p className="mt-4 max-w-md text-sm opacity-95 text-center leading-relaxed">
                {heroDesc}
              </p>
            </div>
          </div>

          {/* Progress / Status Panel */}
          <Card className="border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-8">
              <div className="text-center sm:text-left">
                <h3 className="text-base font-semibold text-slate-800">
                  Booking <span className="font-mono text-emerald-600">#{booking.confirmationNumber}</span> was placed on <span className="font-medium text-slate-900">{formattedPlacedDate}</span>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Live tracking status is updated in real-time as staff processes your vehicle.
                </p>
              </div>

              {/* Progress Timeline */}
              <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Booking timeline</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Status, expected timestamps, and completion ETA for this booking.
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {countdownLabel}: {countdownValue}
                  </div>
                </div>

                <div className="mt-5 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {timelineSteps.map((step) => {
                    const isActive = step.index <= activeStep;
                    const isCurrent = step.index === activeStep;
                    return (
                      <div
                        key={step.index}
                        className={`rounded-2xl border p-4 transition-all ${
                          isActive
                            ? "border-emerald-200 bg-white shadow-sm"
                            : "border-slate-200 bg-white/70"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${
                              isActive
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-200 bg-white text-slate-400"
                            }`}
                          >
                            {step.index}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-extrabold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                              {step.title}
                            </p>
                            <p className={`mt-1 text-xs font-semibold ${isActive ? "text-emerald-700" : "text-slate-400"}`}>
                              {step.time}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <p className={`text-xs ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                            {step.note}
                          </p>
                          {isCurrent ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                              Current
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Next milestone</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {activeStep >= 5 ? "Booking completed" : activeStep === 4 ? "Quality check" : activeStep === 3 ? "Washing" : "Checked in"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Countdown</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{countdownValue}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      {isCompletedBooking ? "Completed at" : "Estimated completion"}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{formatClockLabel(completionAt)}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-600">
                    Expected wash time: <span className="font-semibold text-slate-800">{formattedExpectedDate}</span> at{" "}
                    <span className="font-semibold text-slate-800">{formattedExpectedTime}</span>
                  </div>
                  {booking.washStatus && booking.washStatus !== "NOT_STARTED" && (
                    <Link
                      href="/customer/wash-tracking"
                      className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Go to Live Tracker <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Points Panel */}
          {/* Quick Actions Footer */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild variant="outline" className="rounded-xl px-5 py-2.5 font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              <Link href="/customer/bookings">Back to Bookings List</Link>
            </Button>
            <Button asChild className="rounded-xl px-5 py-2.5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/customer/bookings/new">Book Another Service</Link>
            </Button>
            {canCancelBooking ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-rose-200 bg-rose-50 px-5 py-2.5 font-semibold text-rose-700 hover:bg-rose-100"
                onClick={() => setShowCancelForm((current) => !current)}
                disabled={cancelBookingMutation.isPending}
              >
                Cancel booking
              </Button>
            ) : null}
          </div>

          {canCancelBooking && showCancelForm ? (
            <Card className="border-rose-200 bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle>Cancel this booking</CardTitle>
                <CardDescription>
                  This action will release the scheduled slot. Add a reason if you want it recorded.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  rows={4}
                  placeholder="Reason for cancellation (optional)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    onClick={() => void handleCancelBooking()}
                    disabled={cancelBookingMutation.isPending}
                  >
                    {cancelBookingMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm cancellation
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancelReason("");
                    }}
                    disabled={cancelBookingMutation.isPending}
                  >
                    Keep booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right Column - Sidebar Order Details */}
        <div>
          <Card className="border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden divide-y divide-slate-100">
            {/* Header Panel */}
            <div className="p-6 bg-slate-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Detail</span>
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
                <span className={`rounded px-2 py-0.5 font-bold uppercase tracking-wide ${
                  booking.payment.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
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
                  <span className="font-semibold text-slate-800">{booking.scheduling.bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-semibold text-slate-800">{formattedExpectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Duration:</span>
                  <span className="font-semibold text-slate-800">{booking.scheduling.estimatedDuration} mins</span>
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
                      <div key={addon.addonId} className="flex justify-between text-xs text-slate-400">
                        <span>+ {addon.addonName}</span>
                        <span>{formatBookingCurrency(addon.addonPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>
                    {formatBookingCurrency(booking.pricing.subtotal)}
                  </span>
                </div>

                {booking.pricing.voucherDiscount > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-red-500">
                    <span>Voucher Discount</span>
                    <span>-{formatBookingCurrency(booking.pricing.voucherDiscount)}</span>
                  </div>
                )}

                {booking.pricing.pointsDiscount > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-red-500">
                    <span>Points Discount ({booking.pricing.pointsRedeemed} pts)</span>
                    <span>-{formatBookingCurrency(booking.pricing.pointsDiscount)}</span>
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
