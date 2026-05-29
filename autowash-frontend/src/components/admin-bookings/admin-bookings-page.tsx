"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { useAdminBookings } from "@/hooks/use-admin-reporting";
import type { AdminBookingsFilters } from "@/types/admin-reporting.types";

const PAGE_LIMIT = 20;

export function AdminBookingsPageContent() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminBookingsFilters>({});
  const [draftFilters, setDraftFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    searchQuery: "",
  });

  const normalizedFilters = useMemo<AdminBookingsFilters>(() => {
    return {
      status: filters.status || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      searchQuery: filters.searchQuery || undefined,
    };
  }, [filters]);

  const bookingsQuery = useAdminBookings(normalizedFilters, page, PAGE_LIMIT);

  const applyFilters = () => {
    setFilters({
      status: draftFilters.status || undefined,
      dateFrom: draftFilters.dateFrom || undefined,
      dateTo: draftFilters.dateTo || undefined,
      searchQuery: draftFilters.searchQuery || undefined,
    });
    setPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                Real-time admin booking list with status/date/search filters from `/api/v1/admin/bookings`.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => bookingsQuery.refetch()}
              disabled={bookingsQuery.isFetching}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={draftFilters.status}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
            <Input
              type="date"
              value={draftFilters.dateFrom}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
            />
            <Input
              type="date"
              value={draftFilters.dateTo}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
            />
            <Input
              placeholder="Search by booking / plate / phone"
              value={draftFilters.searchQuery}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, searchQuery: event.target.value }))}
            />
            <Button type="button" onClick={applyFilters}>
              Apply
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsQuery.isPending ? (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading bookings...
              </div>
            ) : bookingsQuery.isError ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {getDisplayErrorMessage(bookingsQuery.error)}
              </p>
            ) : !bookingsQuery.data || bookingsQuery.data.items.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No bookings found for current filters.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Wash</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsQuery.data.items.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell>
                          <div className="font-medium text-slate-900">{booking.bookingId}</div>
                          <div className="text-xs text-slate-500">{formatDateTime(booking.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <Link className="font-medium text-sky-700 hover:underline" href={`/admin/customers/${booking.customerId}`}>
                            {booking.customerName}
                          </Link>
                          <div className="text-xs text-slate-500">{booking.customerPhone}</div>
                        </TableCell>
                        <TableCell>{booking.vehiclePlate}</TableCell>
                        <TableCell>{booking.servicePackageName ?? booking.servicePackageId ?? "N/A"}</TableCell>
                        <TableCell>
                          {booking.bookingDate} {booking.bookingTime}
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={booking.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={booking.paymentStatus} />
                        </TableCell>
                        <TableCell>{booking.washStatus ? <StatusBadge value={booking.washStatus} /> : "N/A"}</TableCell>
                        <TableCell className="text-right">{formatVnd(booking.finalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <p className="text-sm text-slate-500">
                    Page {bookingsQuery.data.pagination.page} / {Math.max(bookingsQuery.data.pagination.totalPages, 1)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={bookingsQuery.data.pagination.page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!bookingsQuery.data.pagination.hasMore}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")} VND`;
}

function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONE[value] ?? "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <Badge className={tone} variant="outline">
      {value}
    </Badge>
  );
}

const STATUS_TONE: Record<string, string> = {
  PENDING: "border-amber-300 bg-amber-100 text-amber-800",
  CONFIRMED: "border-sky-300 bg-sky-100 text-sky-800",
  CHECKED_IN: "border-violet-300 bg-violet-100 text-violet-800",
  IN_PROGRESS: "border-orange-300 bg-orange-100 text-orange-800",
  COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-800",
  CANCELLED: "border-rose-300 bg-rose-100 text-rose-800",
  NO_SHOW: "border-slate-400 bg-slate-200 text-slate-800",
};
