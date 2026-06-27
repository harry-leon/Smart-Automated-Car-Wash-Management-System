"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { formatBookingCurrency, getBookingStatusLabel, humanizeCode } from "@/features/bookings/lib/booking-format";
import { useCustomerBookings } from "@/features/bookings/hooks/use-bookings";
import type { BookingListFilterStatus } from "@/entities/bookings";
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
              <CardTitle>{translate(language, "Lịch đặt của tôi", "Customer bookings")}</CardTitle>
              <CardDescription>
                {translate(
                  language,
                  "Xem lại các lịch đặt và mở trang chi tiết cho bất kỳ lịch nào.",
                  "Review bookings created through the real booking API and open a detail page for any record.",
                )}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as BookingListFilterStatus | "")}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">{translate(language, "Tất cả trạng thái", "All statuses")}</option>
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
                {translate(language, "Tải lại", "Refresh")}
              </Button>
              <Button asChild>
                <Link href="/customer/bookings/new">{translate(language, "Đặt mới", "New booking")}</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {bookingsQuery.isPending ? (
          <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
        ) : bookingsQuery.isError ? (
          <Card className="border-rose-200 bg-white">
            <CardHeader>
              <CardTitle>{translate(language, "Không thể tải lịch đặt", "Unable to load bookings")}</CardTitle>
              <CardDescription>{getDisplayErrorMessage(bookingsQuery.error)}</CardDescription>
            </CardHeader>
          </Card>
        ) : !bookingsQuery.data || bookingsQuery.data.items.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{translate(language, "Không tìm thấy lịch đặt nào", "No bookings found")}</CardTitle>
              <CardDescription>
                {translate(
                  language,
                  "Bộ lọc hiện tại không trả về kết quả nào.",
                  "The current filter combination returned an empty result from the API.",
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
                          : translate(language, "Chưa bắt đầu rửa", "Wash not started")}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        {translate(language, "Xe", "Vehicle")}:{" "}
                        <span className="font-medium text-slate-900">{booking.vehiclePlate}</span>
                      </p>
                      <p>
                        {translate(language, "Dịch vụ", "Service")}:{" "}
                        <span className="font-medium text-slate-900">{booking.packageName ?? "--"}</span>
                      </p>
                      <p>
                        {translate(language, "Lịch hẹn", "Schedule")}:{" "}
                        <span className="font-medium text-slate-900">
                          {booking.bookingDate} {booking.bookingTime}
                        </span>
                      </p>
                      <p>
                        {translate(language, "Tạo lúc", "Created")}:{" "}
                        <span className="font-medium text-slate-900">
                          {new Date(booking.createdAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {translate(language, "Tổng thanh toán", "Final amount")}
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {formatBookingCurrency(booking.finalAmount)}
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/customer/bookings/${booking.bookingId}`}>
                        {translate(language, "Xem chi tiết", "View detail")}
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
