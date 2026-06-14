import { useState } from "react";
import { BellRing, Car, Clock, Eye, X } from "lucide-react";
import { Booking, STATUS_STYLES, fmtBookingMoney, useBookings } from "@/features/customer/bookings/lib/booking-store";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

export function CustomerHistory({ onTrack }: { onTrack: () => void }) {
  const { bookings, transactions, updateStatus, setSelectedBookingId, setReminder } = useBookings();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const upcoming = bookings.filter((booking) =>
    ["Pending", "Confirmed", "Checked-in"].includes(booking.status),
  );
  const past = bookings.filter((booking) =>
    ["Completed", "Cancelled", "No-show"].includes(booking.status),
  );
  const detailBooking = bookings.find((booking) => booking.id === detailId) ?? null;
  const detailTransaction =
    transactions.find((transaction) => transaction.id === detailBooking?.checkoutTransactionId) ??
    transactions.find((transaction) => transaction.bookingId === detailBooking?.id) ??
    null;

  const renderCard = (booking: Booking) => {
    const cancellable = booking.status === "Pending" || booking.status === "Confirmed";
    const trackable = booking.status !== "Cancelled";
    const reminderValue = booking.reminderMinutesBefore
      ? String(booking.reminderMinutesBefore)
      : "none";

    const handleReminderChange = (value: string) => {
      const minutes = value === "none" ? null : Number(value);
      setReminder(booking.id, minutes);
      if (minutes && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      toast.success(
        minutes
          ? `Reminder set ${minutes} minutes before check-in for ${booking.id}.`
          : `Reminder removed for ${booking.id}.`,
      );
    };

    return (
      <Card
        key={booking.id}
        className="group relative overflow-hidden rounded-[1.5rem] border-border/50 bg-card/60 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary shadow-inner transition-transform duration-300 group-hover:scale-105">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-foreground">#{booking.id}</span>
                <span
                  className={cn(
                    "rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
                    STATUS_STYLES[booking.status],
                  )}
                >
                  {booking.status}
                </span>
              </div>
              <div className="mt-2 font-medium text-foreground">
                {booking.vehicleName} <span className="mx-1 text-muted-foreground">/</span>{" "}
                <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {booking.vehiclePlate}
                </span>
              </div>
              <div className="mt-1.5 text-sm font-medium text-muted-foreground">
                {booking.services.join(", ")}
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" /> {booking.scheduledAt}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block border-b border-border/50 pb-3 sm:border-0 sm:pb-0">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total
              </div>
              <div className="text-xl font-bold text-primary">
                {fmtBookingMoney(booking.totalPrice)}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {cancellable && (
                <div className="min-w-[170px]">
                  <Select value={reminderValue} onValueChange={handleReminderChange}>
                    <SelectTrigger
                      className="h-9 rounded-xl border-border/60 bg-background/60 text-xs font-semibold"
                      aria-label={`Reminder for booking ${booking.id}`}
                    >
                      <BellRing className="mr-1.5 h-3.5 w-3.5 text-primary" />
                      <SelectValue placeholder="Reminder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">No reminder</SelectItem>
                        <SelectItem value="15">15 min before</SelectItem>
                        <SelectItem value="30">30 min before</SelectItem>
                        <SelectItem value="60">60 min before</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailId(booking.id)}
                className="rounded-xl font-semibold hover:bg-accent hover:text-foreground"
              >
                <Eye className="mr-1.5 h-4 w-4" /> View
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setSelectedBookingId(booking.id);
                  onTrack();
                }}
                disabled={!trackable}
                className="rounded-xl font-bold shadow-md shadow-primary/20"
              >
                Track
              </Button>
              {cancellable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelId(booking.id)}
                  className="rounded-xl border-rose-200/50 text-rose-600 font-semibold hover:bg-rose-500/10 hover:text-rose-700 hover:border-rose-300"
                >
                  <X className="mr-1.5 h-4 w-4" /> Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Upcoming{" "}
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {upcoming.length}
          </span>
        </h3>
        <div className="space-y-4">
          {upcoming.length === 0 && (
            <p className="text-sm font-medium text-muted-foreground italic pl-4 border-l-2 border-border">
              No upcoming bookings.
            </p>
          )}
          {upcoming.map(renderCard)}
        </div>
      </div>
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> History{" "}
          <span className="bg-accent px-2 py-0.5 rounded-full text-foreground">{past.length}</span>
        </h3>
        <div className="space-y-4">
          {past.length === 0 && (
            <p className="text-sm font-medium text-muted-foreground italic pl-4 border-l-2 border-border">
              No booking history yet.
            </p>
          )}
          {past.map(renderCard)}
        </div>
      </div>

      <AlertDialog open={!!cancelId} onOpenChange={(open: boolean) => !open && setCancelId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border/50 bg-card/90 backdrop-blur-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently cancel booking #{cancelId}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl font-semibold">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20"
              onClick={() => {
                if (!cancelId) return;

                try {
                  updateStatus(cancelId, "Cancelled");
                  toast.success(`Booking ${cancelId} cancelled`);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to cancel booking.");
                } finally {
                  setCancelId(null);
                }
              }}
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detailId} onOpenChange={(open: boolean) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-2xl shadow-2xl p-0">
          {detailBooking && (
            <div className="p-8">
              <DialogHeader className="mb-6 border-b border-border/50 pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  Booking <span className="text-primary">#{detailBooking.id}</span>
                </DialogTitle>
                <DialogDescription className="text-base font-medium mt-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {detailBooking.vehicleName} <span className="opacity-50">/</span>{" "}
                  <span className="font-mono bg-accent px-1.5 py-0.5 rounded">
                    {detailBooking.vehiclePlate}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 text-sm">
                <section className="grid gap-4 rounded-2xl border border-border/50 bg-background/50 p-5 sm:grid-cols-2 shadow-sm">
                  <Info
                    label="Status"
                    value={detailBooking.status}
                    badgeClass={STATUS_STYLES[detailBooking.status]}
                  />
                  <Info label="Customer" value={detailBooking.customerName ?? "Current customer"} />
                  <Info label="Phone" value={detailBooking.customerPhone ?? "-"} />
                  <Info label="Vehicle type" value={detailBooking.vehicleType} />
                  <Info label="Scheduled" value={detailBooking.scheduledAt} />
                  <Info
                    label="Reminder"
                    value={
                      detailBooking.reminderMinutesBefore
                        ? `${detailBooking.reminderMinutesBefore} minutes before check-in`
                        : "None"
                    }
                  />
                  <Info label="Services" value={detailBooking.services.join(", ")} />
                  <Info
                    label="Booking total"
                    value={fmtBookingMoney(detailBooking.totalPrice)}
                    highlight
                  />
                  <Info label="Notes" value={detailBooking.notes || "None"} />
                </section>

                <section className="grid gap-4 rounded-2xl border border-border/50 bg-background/50 p-5 sm:grid-cols-2 shadow-sm">
                  <Info
                    label="Check-in time"
                    value={
                      detailBooking.checkInAt
                        ? new Date(detailBooking.checkInAt).toLocaleString()
                        : "Not checked in"
                    }
                  />
                  <Info label="Wash session" value={detailBooking.washStatus ?? "Not started"} />
                  <Info
                    label="Completed at"
                    value={
                      detailBooking.completedAt
                        ? new Date(detailBooking.completedAt).toLocaleString()
                        : "Not completed"
                    }
                  />
                  <Info
                    label="Payment method"
                    value={detailBooking.checkoutPaymentMethod ?? "Not paid"}
                  />
                </section>

                <section className="rounded-2xl border border-border/50 bg-accent/10 p-5 shadow-sm">
                  <div className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                    Checkout Summary
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Transaction"
                      value={detailBooking.checkoutTransactionId ?? "Pending"}
                    />
                    <Info
                      label="Final amount"
                      highlight
                      value={
                        typeof detailBooking.checkoutAmount === "number"
                          ? fmtBookingMoney(detailBooking.checkoutAmount)
                          : "Pending"
                      }
                    />
                    <Info
                      label="Points redeemed"
                      value={String(detailBooking.checkoutPointsRedeemed ?? 0)}
                    />
                    <Info
                      label="Points earned"
                      value={String(detailBooking.checkoutPointsEarned ?? 0)}
                    />
                    <Info label="Promo code" value={detailBooking.checkoutPromoCode ?? "None"} />
                  </div>
                </section>

                <section className="rounded-2xl border border-border/50 bg-accent/10 p-5 shadow-sm">
                  <div className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                    Payment Transaction
                  </div>
                  {detailTransaction ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Info label="Receipt ID" value={detailTransaction.id} />
                      <Info
                        label="Paid at"
                        value={new Date(detailTransaction.date).toLocaleString()}
                      />
                      <Info label="Subtotal" value={fmtBookingMoney(detailTransaction.subtotal)} />
                      <Info
                        label="Total paid"
                        value={fmtBookingMoney(detailTransaction.finalAmount)}
                        highlight
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground italic py-2">
                      No transaction recorded yet.
                    </p>
                  )}
                </section>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({
  label,
  value,
  badgeClass,
  highlight,
}: {
  label: string;
  value: string;
  badgeClass?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {badgeClass ? (
        <span
          className={cn(
            "mt-1.5 inline-flex rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
            badgeClass,
          )}
        >
          {value}
        </span>
      ) : (
        <div
          className={cn(
            "mt-1.5 font-medium",
            highlight ? "text-lg font-bold text-primary" : "text-foreground",
          )}
        >
          {value}
        </div>
      )}
    </div>
  );
}
