import { Check, Clock, CheckCircle2, Car, ReceiptText, XCircle, ChevronDown } from "lucide-react";
import type { ElementType } from "react";
import { BookingStatus, STATUS_STYLES, fmtBookingMoney, useBookings } from "@/lib/booking-store";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCarwashStore } from "@/lib/carwash-store";

const STEPS: { key: BookingStatus; label: string; desc: string; Icon: ElementType }[] = [
  { key: "Pending", label: "Pending", desc: "Awaiting approval", Icon: Clock },
  { key: "Confirmed", label: "Confirmed", desc: "Slot secured", Icon: CheckCircle2 },
  { key: "Checked-in", label: "Checked-in", desc: "Vehicle arrived", Icon: Car },
  { key: "Completed", label: "Completed", desc: "Checkout completed", Icon: ReceiptText },
];

export function LiveTracker() {
  const { bookings, transactions, selectedBookingId, setSelectedBookingId } = useBookings();
  const { washSessions } = useCarwashStore();
  const booking = bookings.find((item) => item.id === selectedBookingId) ?? bookings[0];

  if (!booking) {
    return (
      <Card className="p-12 text-center text-muted-foreground rounded-[2rem] border-border/50 bg-card/60 backdrop-blur-xl shadow-xl">
        No bookings to track.
      </Card>
    );
  }

  const activeIdx = Math.max(
    STEPS.findIndex((step) => step.key === booking.status),
    0,
  );
  const isCancelled = booking.status === "Cancelled";
  const transaction =
    transactions.find((item) => item.id === booking.checkoutTransactionId) ??
    transactions.find((item) => item.bookingId === booking.id) ??
    null;
  const session = washSessions.find((item) => item.bookingId === booking.id) ?? null;

  return (
    <div className="space-y-8">
      <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Now tracking
            </div>
            <div className="text-3xl font-black text-foreground">
              Booking <span className="text-primary">#{booking.id}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
              <span className="bg-background/50 px-2 py-1 rounded-md border border-border/50 shadow-sm">
                {booking.vehicleName}
              </span>
              <span className="opacity-50">/</span>
              <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">
                {booking.vehiclePlate}
              </span>
              <span className="opacity-50">/</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {booking.scheduledAt}
              </span>
            </div>
          </div>
          <div className="min-w-[240px] w-full md:w-auto">
            <Select value={booking.id} onValueChange={setSelectedBookingId}>
              <SelectTrigger className="h-12 rounded-xl border-border/60 bg-background/50 font-bold shadow-sm transition-all focus:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-card/90 backdrop-blur-xl">
                {bookings.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="font-medium">
                    #{item.id} <span className="opacity-50 mx-1">/</span>{" "}
                    <span className="font-mono text-primary">{item.vehiclePlate}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="rounded-[2rem] border-border/50 bg-card/60 p-8 sm:p-12 backdrop-blur-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        {isCancelled ? (
          <div className="relative z-10 flex flex-col items-center gap-4 py-8 text-center animate-in zoom-in-95 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 shadow-inner">
              <XCircle className="h-10 w-10 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">Booking Cancelled</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">
                This booking has been cancelled and cannot be tracked.
              </div>
            </div>
            <span
              className={cn(
                "mt-4 rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-sm",
                STATUS_STYLES.Cancelled,
              )}
            >
              Cancelled
            </span>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Desktop Tracker */}
            <div className="relative hidden items-start justify-between md:flex">
              <div className="absolute left-[10%] right-[10%] top-8 h-1.5 rounded-full bg-accent/50 shadow-inner overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
              {STEPS.map((step, index) => {
                const done = index < activeIdx;
                const active = index === activeIdx;
                const Icon = step.Icon;
                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex flex-1 flex-col items-center text-center group"
                  >
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] transition-all duration-500 shadow-sm",
                        done
                          ? "border-primary bg-primary text-primary-foreground shadow-primary/20"
                          : active
                            ? "scale-110 border-primary bg-background text-primary shadow-lg shadow-primary/30 rotate-3"
                            : "border-border/50 bg-background/50 text-muted-foreground/50 group-hover:border-primary/30",
                      )}
                    >
                      {done ? (
                        <Check className="h-7 w-7" />
                      ) : (
                        <Icon className={cn("h-7 w-7", active ? "animate-pulse" : "")} />
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-5 font-bold text-base transition-colors",
                        active
                          ? "text-primary"
                          : done
                            ? "text-foreground"
                            : "text-muted-foreground/70",
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground">
                      {step.desc}
                    </div>
                    {active && (
                      <span
                        className={cn(
                          "mt-3 rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm absolute -bottom-8 animate-in slide-in-from-top-2",
                          STATUS_STYLES[step.key],
                        )}
                      >
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Tracker */}
            <div className="space-y-6 md:hidden relative">
              <div className="absolute left-6 top-6 bottom-6 w-1 rounded-full bg-accent/50 shadow-inner overflow-hidden">
                <div
                  className="w-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ height: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
              {STEPS.map((step, index) => {
                const done = index < activeIdx;
                const active = index === activeIdx;
                const Icon = step.Icon;
                return (
                  <div
                    key={step.key}
                    className={cn(
                      "flex gap-5 relative z-10",
                      active ? "scale-105 origin-left transition-transform" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[3px] transition-colors shadow-sm",
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : active
                            ? "border-primary bg-background text-primary shadow-md shadow-primary/20"
                            : "border-border/50 bg-background/50 text-muted-foreground/50",
                      )}
                    >
                      {done ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className={cn("h-5 w-5", active ? "animate-pulse" : "")} />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <div
                        className={cn(
                          "font-bold text-base",
                          active
                            ? "text-primary"
                            : done
                              ? "text-foreground"
                              : "text-muted-foreground/70",
                        )}
                      >
                        {step.label}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
          <h4 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/50 pb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Booking Details
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <InfoItem label="Services" value={booking.services.join(", ")} />
            <InfoItem label="Scheduled" value={booking.scheduledAt} />
            <InfoItem
              label="Check-in Time"
              value={booking.checkInAt ? new Date(booking.checkInAt).toLocaleString() : "Waiting"}
            />
            <InfoItem label="Assigned Employee" value={session?.staffName ?? "Waiting"} />
            <InfoItem label="Total" value={fmtBookingMoney(booking.totalPrice)} highlight />
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50 mt-2">
              <InfoItem
                label="Status"
                value={booking.status}
                badge={STATUS_STYLES[booking.status]}
              />
              <InfoItem label="Wash Session" value={booking.washStatus ?? "Not started"} />
              <InfoItem
                label="Session Timeline"
                value={
                  session
                    ? `${new Date(session.startedAt).toLocaleString()} -> ${session.completedAt ? new Date(session.completedAt).toLocaleString() : session.status}`
                    : "Waiting"
                }
              />
              <InfoItem label="Payment" value={booking.checkoutPaymentMethod ?? "Pending"} />
              <InfoItem
                label="Loyalty"
                value={`+${booking.checkoutPointsEarned ?? 0} / -${booking.checkoutPointsRedeemed ?? 0}`}
              />
            </div>
          </dl>
        </Card>

        <Card className="rounded-[1.5rem] border-border/50 bg-card/60 p-8 backdrop-blur-xl shadow-lg transition-all hover:shadow-xl">
          <h4 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/50 pb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Checkout & Payment
          </h4>
          {transaction ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <InfoItem label="Transaction" value={transaction.id} />
              <InfoItem label="Completed" value={new Date(transaction.date).toLocaleString()} />
              <InfoItem
                label="Final Amount"
                value={fmtBookingMoney(transaction.finalAmount)}
                highlight
                className="sm:col-span-2 p-4 bg-background/50 rounded-xl border border-border/50"
              />
              <div className="sm:col-span-2 p-4 bg-emerald-500/10 rounded-xl border border-emerald-200/50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Points Earned
                </span>
                <span className="font-bold text-emerald-600 bg-background px-2 py-1 rounded-md shadow-sm">
                  +{transaction.pointsEarned} pts
                </span>
              </div>
            </dl>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/70">
              <ReceiptText className="h-12 w-12 mb-3 opacity-20" />
              <div className="text-sm font-medium">
                Checkout summary will appear here
                <br />
                after payment is completed.
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  highlight,
  badge,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </dt>
      <dd>
        {badge ? (
          <span
            className={cn(
              "rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm inline-flex",
              badge,
            )}
          >
            {value}
          </span>
        ) : (
          <span
            className={cn(
              "font-medium",
              highlight ? "text-lg font-black text-primary" : "text-foreground",
            )}
          >
            {value}
          </span>
        )}
      </dd>
    </div>
  );
}
