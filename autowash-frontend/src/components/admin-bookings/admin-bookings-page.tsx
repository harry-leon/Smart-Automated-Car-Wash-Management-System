"use client";

import { useState } from "react";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDisplayErrorMessage } from "@/lib/api-errors";
import { useAdminBookings } from "@/hooks/use-admin-bookings";

const PAGE_LIMIT = 20;

export function AdminBookingsPageContent() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  
  const bookingsQuery = useAdminBookings(page, PAGE_LIMIT, {
    searchQuery: activeSearch || undefined,
  });

  const canGoPrev = page > 1;
  const canGoNext = Boolean(bookingsQuery.data?.pagination.page < (bookingsQuery.data?.pagination.totalPages || 0));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Bookings Management</CardTitle>
              <CardDescription>
                Manage all customer bookings across the system.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    className="pl-8"
                    placeholder="Search by plate or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary">Search</Button>
              </form>
              <Button
                type="button"
                variant="outline"
                onClick={() => bookingsQuery.refetch()}
                disabled={bookingsQuery.isFetching}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="space-y-4 pt-6">
            {bookingsQuery.isPending ? (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading bookings...
              </div>
            ) : bookingsQuery.isError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {getDisplayErrorMessage(bookingsQuery.error)}
              </div>
            ) : !bookingsQuery.data || bookingsQuery.data.items.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No bookings found.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID / Plate</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsQuery.data.items.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell>
                          <div className="font-bold text-slate-900">{booking.vehiclePlate}</div>
                          <div className="text-xs font-mono text-slate-500">{booking.bookingId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{booking.customerName}</div>
                          <div className="text-xs text-slate-500">{booking.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{booking.servicePackageName}</div>
                          <div className="text-xs font-medium text-slate-700">
                            {booking.finalAmount.toLocaleString("vi-VN")} VND
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(booking.bookingDate)}</div>
                          <div className="text-xs text-slate-500">{booking.bookingTime}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.status === "CONFIRMED" ? "default" : booking.status === "PENDING" ? "secondary" : "outline"}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs uppercase tracking-wider">{booking.paymentMethod}</div>
                          <div className={`text-xs font-bold ${booking.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {booking.paymentStatus}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-slate-500">
                    Page {bookingsQuery.data.pagination.page} of {Math.max(bookingsQuery.data.pagination.totalPages, 1)}
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" disabled={!canGoPrev} onClick={() => setPage((value) => value - 1)}>
                      Previous
                    </Button>
                    <Button type="button" variant="outline" disabled={!canGoNext} onClick={() => setPage((value) => value + 1)}>
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

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
}
