"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { buildLoyaltySummary, formatLoyaltyPoints, formatLoyaltyTransactionType } from "@/features/customer/loyalty/lib/customer-loyalty";
import { formatBookingCurrency, getBookingStatusLabel, humanizeCode } from "@/features/customer/bookings/lib/booking-format";
import { useCustomerBookings } from "@/features/customer/bookings/hooks/use-bookings";
import {
  useCustomerLoyaltyAccount,
  useCustomerLoyaltyTransactions,
  useCustomerWashHistory,
} from "@/features/customer/loyalty/hooks/use-customer-loyalty";
import { useLanguageStore, translate } from "@/shared/store/language.store";

export function CustomerHistoryPageContent() {
  const { language } = useLanguageStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "washes" | "points">("bookings");
  const bookingsQuery = useCustomerBookings({ page: 1, limit: 50 });
  const washHistoryQuery = useCustomerWashHistory(1, 50);
  const transactionsQuery = useCustomerLoyaltyTransactions(1, 50);
  const accountQuery = useCustomerLoyaltyAccount();
  const locale = language === "vi" ? "vi-VN" : "en-US";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        bookingsQuery.refetch(),
        washHistoryQuery.refetch(),
        transactionsQuery.refetch(),
        accountQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const summary = accountQuery.data ? buildLoyaltySummary(accountQuery.data) : null;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-border/70 bg-card shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:shadow-none">
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>{translate("Lịch sử khách hàng", "Customer history", language)}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isRefreshing ? translate("Đang tải lại...", "Refreshing...", language) : translate("Tải lại", "Refresh", language)}
              </Button>
              <Button asChild>
                <Link href="/customer/loyalty/history">{translate("Xem lịch sử điểm", "Open point history", language)}</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {summary ? (
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label={translate("Điểm khả dụng", "Available points", language)} value={summary.availablePoints.toLocaleString(locale)} />
            <StatCard label={translate("Điểm tích lũy", "Lifetime points", language)} value={summary.lifetimePoints.toLocaleString(locale)} />
            <StatCard
              label={translate("Tiến trình hạng", "Tier progress", language)}
              value={
                summary.progress.nextTier
                  ? `${summary.progress.progressPercent}% ${translate("đến", "to", language)} ${summary.progress.nextTier}`
                  : translate("Đạt hạng cao nhất", "Top tier reached", language)
              }
            />
          </section>
        ) : null}

        <div className="space-y-4">
          <div className="grid w-full max-w-xl grid-cols-3 rounded-xl bg-card/80 p-1 shadow-sm border border-border/50">
            <TabButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")}>
              {translate("Đặt lịch", "Bookings", language)}
            </TabButton>
            <TabButton active={activeTab === "washes"} onClick={() => setActiveTab("washes")}>
              {translate("Lịch sử rửa xe", "Wash history", language)}
            </TabButton>
            <TabButton active={activeTab === "points"} onClick={() => setActiveTab("points")}>
              {translate("Lịch sử điểm", "Point history", language)}
            </TabButton>
          </div>

          {activeTab === "bookings" ? (
            <HistorySection
              title={translate("Lịch sử đặt lịch", "Booking history", language)}
              description={translate("Các lịch hẹn sắp tới và đã hoàn thành.", "Upcoming and completed bookings created through the booking flow.", language)}
              isPending={bookingsQuery.isPending}
              isError={bookingsQuery.isError}
              error={bookingsQuery.error}
              isEmpty={!bookingsQuery.data || bookingsQuery.data.items.length === 0}
            >
              <div className="grid gap-4">
                {bookingsQuery.data?.items.map((booking) => (
                  <Card key={booking.bookingId} className="border-border/70 bg-card">
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-foreground">
                            {booking.packageName ?? translate("Đặt lịch", "Booking", language)}
                          </h3>
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {getBookingStatusLabel(booking.status)}
                          </span>
                        </div>
                        <div className="grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
                          <p>{translate("Xe", "Vehicle", language)}: <span className="font-medium text-foreground">{booking.vehiclePlate}</span></p>
                          <p>{translate("Dịch vụ", "Service", language)}: <span className="font-medium text-foreground">{booking.packageName ?? "--"}</span></p>
                          <p>{translate("Lịch hẹn", "Schedule", language)}: <span className="font-medium text-foreground">{formatSchedule(booking.bookingDate, booking.bookingTime)}</span></p>
                          <p>{translate("Rửa xe", "Wash", language)}: <span className="font-medium text-foreground">{booking.washStatus ? humanizeCode(booking.washStatus) : translate("Chưa bắt đầu", "Not started", language)}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{translate("Tổng thanh toán", "Final amount", language)}</div>
                        <div className="text-xl font-black text-foreground">{formatBookingCurrency(booking.finalAmount)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </HistorySection>
          ) : null}

          {activeTab === "washes" ? (
            <HistorySection
              title={translate("Lịch sử rửa xe", "Wash history", language)}
              description={translate("Các lần rửa xe đã hoàn thành và điểm được tích.", "Completed wash sessions and points earned after staff completes the wash.", language)}
              isPending={washHistoryQuery.isPending}
              isError={washHistoryQuery.isError}
              error={washHistoryQuery.error}
              isEmpty={!washHistoryQuery.data || washHistoryQuery.data.items.length === 0}
            >
              <div className="grid gap-4">
                {washHistoryQuery.data?.items.map((wash) => (
                  <Card key={wash.sessionId} className="border-border/70 bg-card">
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-foreground">
                            {wash.packageName ?? translate("Phiên rửa xe", "Wash session", language)}
                          </h3>
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {humanizeCode(wash.status)}
                          </span>
                        </div>
                        <div className="grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
                          <p>{translate("Xe", "Vehicle", language)}: <span className="font-medium text-foreground">{wash.vehiclePlate}</span></p>
                          <p>{translate("Dịch vụ", "Service", language)}: <span className="font-medium text-foreground">{wash.packageName ?? "--"}</span></p>
                          <p>{translate("Lịch hẹn", "Booked for", language)}: <span className="font-medium text-foreground">{formatSchedule(wash.bookingDate, wash.bookingTime)}</span></p>
                          <p>{translate("Hoàn thành", "Completed", language)}: <span className="font-medium text-foreground">{formatDateTime(wash.completedAt, locale)}</span></p>
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{translate("Đã thanh toán", "Paid", language)}</div>
                          <div className="text-xl font-black text-foreground">{formatBookingCurrency(wash.finalAmount)}</div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          +{wash.awardedPoints.toLocaleString(locale)} pts
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </HistorySection>
          ) : null}

          {activeTab === "points" ? (
            <HistorySection
              title={translate("Giao dịch điểm", "Point transactions", language)}
              description={translate("Hoạt động tích điểm từ các lần rửa xe hoàn thành.", "Mandatory-first loyalty activity derived from completed wash sessions.", language)}
              isPending={transactionsQuery.isPending}
              isError={transactionsQuery.isError}
              error={transactionsQuery.error}
              isEmpty={!transactionsQuery.data || transactionsQuery.data.items.length === 0}
            >
              <div className="grid gap-4">
                {transactionsQuery.data?.items.map((item) => (
                  <Card key={item.transactionId} className="border-border/70 bg-card">
                    <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-base font-black text-foreground">{formatLoyaltyTransactionType(item.type)}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString(locale)}
                        </div>
                      </div>
                      <div className={item.points >= 0 ? "text-right text-lg font-black text-emerald-600 dark:text-emerald-400" : "text-right text-lg font-black text-rose-600 dark:text-rose-400"}>
                        {formatLoyaltyPoints(item.points)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </HistorySection>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatSchedule(date: string, time: string) {
  const [year, month, day] = date.split("-");
  const timePart = time.split(":").slice(0, 2).join(":");
  return `${day}/${month}/${year} ${timePart}`;
}

function formatDateTime(iso: string, locale: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm"
          : "rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
      }
    >
      {children}
    </button>
  );
}

function HistorySection({
  title,
  description,
  isPending,
  isError,
  error,
  isEmpty,
  children,
}: {
  title: string;
  description: string;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  if (isPending) {
    return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{getDisplayErrorMessage(error)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 bg-card shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:shadow-none">
      <CardContent className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-black tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
