"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { formatBookingCurrency, getBookingStatusLabel, humanizeCode } from "@/features/customer/bookings/lib/booking-format";
import { useCustomerBookings } from "@/features/customer/bookings/hooks/use-bookings";
import type { BookingListFilterStatus } from "@/features/customer/bookings/booking.types";
import { useLanguageStore, translate } from "@/shared/store/language.store";

const STATUS_OPTIONS_VI = [
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đã nhận xe", value: "CHECKED_IN" },
  { label: "Đang thực hiện", value: "IN_PROGRESS" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã huỷ", value: "CANCELLED" },
] as const;

const STATUS_OPTIONS_EN = [
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Checked in", value: "CHECKED_IN" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

export function CustomerBookingListPage() {
  const { language } = useLanguageStore();
  const [status, setStatus] = useState<BookingListFilterStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const bookingsQuery = useCustomerBookings({
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const statusOptions = language === "vi" ? STATUS_OPTIONS_VI : STATUS_OPTIONS_EN;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>{translate("Lịch đặt của tôi", "Customer bookings", language)}</CardTitle>
              <CardDescription>
                {translate(
                  "Xem lại các lịch đặt và mở trang chi tiết cho bất kỳ lịch nào.",
                  "Review bookings created through the real booking API and open a detail page for any record.",
                  language,
                )}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as BookingListFilterStatus | "")}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">{translate("Tất cả trạng thái", "All statuses", language)}</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <Button type="button" variant="outline" onClick={() => bookingsQuery.refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {translate("Tải lại", "Refresh", language)}
              </Button>
              <Button asChild>
                <Link href="/customer/bookings/new">{translate("Đặt mới", "New booking", language)}</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {bookingsQuery.isPending ? (
          <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
        ) : bookingsQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>{translate("Không thể tải lịch đặt", "Unable to load bookings", language)}</CardTitle>
              <CardDescription>{getDisplayErrorMessage(bookingsQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : !bookingsQuery.data || bookingsQuery.data.items.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{translate("Không tìm thấy lịch đặt nào", "No bookings found", language)}</CardTitle>
              <CardDescription>
                {translate(
                  "Bộ lọc hiện tại không trả về kết quả nào.",
                  "The current filter combination returned an empty result from the API.",
                  language,
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookingsQuery.data.items.map((booking) => (
              <Card
                key={booking.bookingId}
                className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
              >
                <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{booking.bookingId}</h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {getBookingStatusLabel(booking.status)}
                      </span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {booking.washStatus
                          ? humanizeCode(booking.washStatus)
                          : translate("Chưa bắt đầu rửa", "Wash not started", language)}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        {translate("Xe", "Vehicle", language)}:{" "}
                        <span className="font-medium text-slate-900">{booking.vehiclePlate}</span>
                      </p>
                      <p>
                        {translate("Dịch vụ", "Service", language)}:{" "}
                        <span className="font-medium text-slate-900">{booking.packageName ?? "--"}</span>
                      </p>
                      <p>
                        {translate("Lịch hẹn", "Schedule", language)}:{" "}
                        <span className="font-medium text-slate-900">
                          {booking.bookingDate} {booking.bookingTime}
                        </span>
                      </p>
                      <p>
                        {translate("Tạo lúc", "Created", language)}:{" "}
                        <span className="font-medium text-slate-900">
                          {new Date(booking.createdAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {translate("Tổng thanh toán", "Final amount", language)}
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {formatBookingCurrency(booking.finalAmount)}
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/customer/bookings/${booking.bookingId}`}>
                        {translate("Xem chi tiết", "View detail", language)}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
