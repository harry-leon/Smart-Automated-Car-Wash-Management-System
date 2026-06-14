"use client";

import { useAdminBookingDetail } from "@/features/admin/bookings/hooks/use-admin-booking-detail";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Loader2, ArrowLeft, Calendar, Clock, CreditCard, User, Car, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function AdminBookingDetail({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: booking, isPending, isError, error } = useAdminBookingDetail(bookingId);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-6 text-rose-700 m-8">
        <h2 className="text-lg font-bold mb-2">Error Loading Booking</h2>
        <p>{getDisplayErrorMessage(error)}</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center p-8 text-slate-500">
        Booking not found.
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null) return "0 VND";
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED": return "bg-rose-100 text-rose-800 border-rose-200";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    // Ràng buộc trạng thái: không cho lùi về các trạng thái đã qua
    const flow = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED"];
    const currentIndex = flow.indexOf(currentStatus);
    
    // Nếu là trạng thái cuối (terminal state)
    if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(currentStatus)) {
      return [currentStatus];
    }

    let available = flow.slice(currentIndex); // Chỉ cho phép trạng thái hiện tại và tiếp theo
    
    // Luôn có thể hủy nếu chưa xong
    if (!available.includes("CANCELLED")) available.push("CANCELLED");
    if (!available.includes("NO_SHOW")) available.push("NO_SHOW");

    return available;
  };

  const availableStatuses = getAvailableStatuses(booking.status);
  const isTerminalState = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Booking #{booking.confirmationNumber}
        </h1>
        <div className="ml-4">
          <Select defaultValue={booking.status} disabled={isTerminalState}>
            <SelectTrigger className={`h-8 font-semibold rounded-full px-4 ${statusColor(booking.status)}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((st) => (
                <SelectItem key={st} value={st}>
                  {st.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{booking.packageName || "Custom Service"}</h3>
                    <p className="text-sm text-slate-500">Duration: ~{booking.scheduling.estimatedDuration} mins</p>
                  </div>
                  <div className="font-bold text-lg">{formatCurrency(booking.pricing.basePrice)}</div>
                </div>
              </div>

              {booking.addons && booking.addons.length > 0 && (
                <div className="mb-4 pb-4 border-b">
                  <h4 className="font-medium mb-3 text-slate-700">Add-ons</h4>
                  <ul className="space-y-2">
                    {booking.addons.map((addon) => (
                      <li key={addon.addonId} className="flex justify-between text-sm">
                        <span>{addon.addonName}</span>
                        <span>{formatCurrency(addon.addonPrice)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(booking.pricing.subtotal)}</span>
                </div>
                {booking.pricing.voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({booking.pricing.voucherCode})</span>
                    <span>-{formatCurrency(booking.pricing.voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4">
                  <span>Total</span>
                  <span className="text-blue-600">{formatCurrency(booking.pricing.finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-slate-600">{new Date(booking.scheduling.bookingDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-slate-600">
                      {booking.scheduling.bookingTime.substring(0, 5)} - {booking.scheduling.estimatedEndTime}
                    </p>
                  </div>
                </div>
              </div>

              {booking.washStatus && (
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Wash Session Status</p>
                    <p className="text-xs text-slate-500">ID: {booking.washSessionId}</p>
                  </div>
                  <Badge variant="secondary">{booking.washStatus}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">{booking.customerName}</p>
                  <p className="text-sm text-slate-500">{booking.customerPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-lg font-bold uppercase tracking-wider">{booking.vehiclePlate}</p>
                  <p className="text-sm text-slate-500">{booking.vehicleBrand} {booking.vehicleModel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium uppercase">{booking.payment.method.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-500">{booking.payment.transactionId}</p>
                </div>
                {booking.payment.status === "PAID" || booking.payment.status === "CONFIRMED" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
              </div>
              <div className="pt-2 border-t mt-2">
                <Badge variant={booking.payment.status === "PAID" ? "default" : "outline"} className={booking.payment.status === "PAID" ? "bg-emerald-100 text-emerald-800" : ""}>
                  {booking.payment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
