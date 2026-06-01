"use client";

import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import {
  formatBookingCurrency,
  getBookingStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  humanizeCode,
} from "@/lib/booking-format";
import { useCustomerBookingDetail } from "@/hooks/use-bookings";

export function CustomerBookingDetailPage({ bookingId }: { bookingId: string }) {
  const bookingQuery = useCustomerBookingDetail(bookingId);

  if (bookingQuery.isPending) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto h-80 max-w-5xl animate-pulse rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (bookingQuery.isError) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-4xl border-rose-200 bg-white">
          <CardHeader>
            <CardTitle>Unable to load booking detail</CardTitle>
            <CardDescription>{getDisplayErrorMessage(bookingQuery.error)}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => bookingQuery.refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
            <Button asChild>
              <Link href="/customer/bookings">Back to bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingQuery.data) {
    return null;
  }

  const booking = bookingQuery.data;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardDescription>Customer booking detail</CardDescription>
              <CardTitle>{booking.bookingId}</CardTitle>
              <CardDescription className="mt-2">
                Confirmation {booking.confirmationNumber}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {getBookingStatusLabel(booking.status)}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {booking.washStatus ? humanizeCode(booking.washStatus) : "Wash not started"}
              </span>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <DetailSection
            title="Customer and vehicle"
            rows={[
              ["Customer", booking.customerName],
              ["Phone", booking.customerPhone],
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
              ["Transaction", booking.payment.transactionId],
            ]}
          />

          <DetailSection
            title="Pricing"
            rows={[
              ["Base price", formatBookingCurrency(booking.pricing.basePrice)],
              ["Add-ons total", formatBookingCurrency(booking.pricing.addonsTotal)],
              ["Subtotal", formatBookingCurrency(booking.pricing.subtotal)],
              ["Voucher", booking.pricing.voucherCode ?? "--"],
              ["Voucher discount", formatBookingCurrency(booking.pricing.voucherDiscount)],
              ["Final amount", formatBookingCurrency(booking.pricing.finalAmount)],
            ]}
          />

          <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Add-ons and notes</CardTitle>
              <CardDescription>
                The detail payload exposes optional add-ons, notes, and wash metadata from the backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">Add-ons</div>
                {booking.addons.length > 0 ? (
                  <div className="space-y-2">
                    {booking.addons.map((addon) => (
                      <div
                        key={addon.addonId}
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                      >
                        <span>{addon.addonName}</span>
                        <span className="font-medium text-slate-900">
                          {formatBookingCurrency(addon.addonPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No add-ons selected.</p>
                )}
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">Notes</div>
                <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  {booking.notes ?? "No note attached to this booking."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/customer/bookings">Back to bookings</Link>
          </Button>
          <Button asChild>
            <Link href="/customer/bookings/new">Create new booking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 text-sm last:border-b-0 last:pb-0"
          >
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-medium text-slate-900">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
