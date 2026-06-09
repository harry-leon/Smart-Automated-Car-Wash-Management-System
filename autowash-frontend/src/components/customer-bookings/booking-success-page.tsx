 "use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Check, Car, Calendar, User, Mail, Phone, FileText, ChevronRight, Download, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { formatBookingCurrency, getPaymentMethodLabel, getPaymentStatusLabel } from "@/lib/booking-format";
import { useCustomerBookingDetail } from "@/hooks/use-bookings";
import { useCustomerProfile } from "@/hooks/use-customer-profile";

export function CustomerBookingSuccessPage({ bookingId }: { bookingId: string }) {
  const bookingQuery = useCustomerBookingDetail(bookingId);
  const profileQuery = useCustomerProfile();

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
              {bookingQuery.isError ? getDisplayErrorMessage(bookingQuery.error) : "Booking not found."}
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

  const formattedPlacedDate = new Date(booking.createdAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedExpectedDate = new Date(booking.scheduling.bookingDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          <div className="relative overflow-hidden rounded-3xl bg-[#2ecc71] px-6 py-12 text-center text-white shadow-lg">
            {/* Decorative floating shapes in background */}
            <div className="absolute top-10 left-10 h-3 w-3 rounded-full bg-white/20 animate-ping" />
            <div className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-white/10" />

            <div className="flex flex-col items-center justify-center">
              {/* Floating animated checkmark circle with confetti */}
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#2ecc71] shadow-xl transition-transform hover:scale-105">
                <Check className="h-12 w-12 stroke-[4]" />
                {/* Confetti details */}
                <span className="absolute -top-3 -left-3 animate-pulse text-amber-300 text-xl">✦</span>
                <span className="absolute -top-6 right-2 text-violet-200 text-sm">◆</span>
                <span className="absolute top-2 -right-6 text-pink-300 text-sm">●</span>
                <span className="absolute bottom-2 -left-6 text-sky-200 text-md">▲</span>
                <span className="absolute -bottom-4 left-4 text-emerald-100 text-xl">★</span>
                <span className="absolute bottom-6 -right-4 text-yellow-300 text-xs">■</span>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">Thank You</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-wide uppercase sm:text-3xl">
                Your Booking is Confirmed
              </h1>
              <p className="mt-4 max-w-md text-sm text-emerald-50 text-center leading-relaxed">
                We have received your booking and sent a confirmation email to{" "}
                <span className="font-semibold underline">{customerEmail}</span> shortly.
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
                  Your car wash session schedule is confirmed and is currently pending check-in.
                </p>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 py-4">
                {/* Connecting Line (Desktop) */}
                <div className="absolute top-[24px] left-[10%] right-[10%] h-0.5 bg-slate-100 -z-1 hidden md:block">
                  <div className="h-full bg-emerald-500" style={{ width: "20%" }} />
                </div>

                {/* Step 1: CONFIRMED */}
                <div className="flex flex-col items-center text-center relative z-10 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white shadow-md">
                    <Check className="h-5 w-5 stroke-[3]" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-800">BOOKING CONFIRMED</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Scheduled</div>
                </div>

                {/* Step 2: CHECKED IN */}
                <div className="flex flex-col items-center text-center relative z-10 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-400">
                    <span>2</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-400">CHECKED IN</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Vehicle at bay</div>
                </div>

                {/* Step 3: WASHING */}
                <div className="flex flex-col items-center text-center relative z-10 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-400">
                    <span>3</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-400">WASHING</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">In progress</div>
                </div>

                {/* Step 4: QUALITY CHECK */}
                <div className="flex flex-col items-center text-center relative z-10 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-400">
                    <span>4</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-400">QUALITY CHECK</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Inspection</div>
                </div>

                {/* Step 5: COMPLETED */}
                <div className="flex flex-col items-center text-center relative z-10 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-400">
                    <span>5</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-400">COMPLETED</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ready for pickup</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 gap-4">
                <div className="text-sm text-slate-600">
                  Expected Wash Time: <span className="font-semibold text-slate-800">{formattedExpectedDate}</span> at <span className="font-semibold text-slate-800">{booking.scheduling.bookingTime}</span>
                </div>
                <Link
                  href={`/customer/bookings/${booking.bookingId}`}
                  className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
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
            <Button asChild variant="outline" className="rounded-xl px-5 py-2.5 font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              <Link href="/customer/bookings">Back to Bookings List</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-700 font-semibold">
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
                  <span className="font-semibold text-slate-800">{booking.scheduling.bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-semibold text-slate-800">{booking.scheduling.bookingTime}</span>
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
