import * as React from "react";
import { ClipboardList, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCarwashStore } from "@/lib/carwash-store";

const PAGE_SIZE = 8;

export function AdminBookingsPage() {
  const { bookings, cancelBookingWithRefund, markRefundCompleted } = useCarwashStore();
  const [page, setPage] = React.useState(1);
  const [cancelTarget, setCancelTarget] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const rows = React.useMemo(
    () =>
      [...bookings].sort(
        (a, b) =>
          new Date(`${b.dateISO} ${b.timeSlot}`).getTime() -
          new Date(`${a.dateISO} ${a.timeSlot}`).getTime(),
      ),
    [bookings],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const bookingToCancel = rows.find((booking) => booking.id === cancelTarget) ?? null;

  const handleForceCancel = async () => {
    if (!bookingToCancel) return;
    try {
      setBusyId(`cancel:${bookingToCancel.id}`);
      await delay();
      const result = cancelBookingWithRefund(bookingToCancel.id, "Admin", reason);
      toast.success(`Force cancelled. Refund ${formatMoney(result.refundAmount)}.`);
      setCancelTarget(null);
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to force cancel booking.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRefundComplete = async (bookingId: string) => {
    try {
      setBusyId(`refund:${bookingId}`);
      await delay();
      const amount = markRefundCompleted(bookingId);
      toast.success(`Refund completed for ${formatMoney(amount)}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete refund.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <ClipboardList className="h-3.5 w-3.5" /> Admin bookings
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Cancellation and refund control
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Force cancel bookings, inspect who cancelled them, and complete pending wallet refunds.
          </p>
        </div>

        <Card className="rounded-xl shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cancelled by</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((booking) => {
                  const canCancel = booking.status === "Pending" || booking.status === "Confirmed";
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-semibold">{booking.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {booking.services.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{booking.customerName ?? "—"}</TableCell>
                      <TableCell>
                        {booking.dateISO} {booking.timeSlot}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>{booking.cancelledBy ?? "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {booking.cancelReason ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatMoney(booking.refundAmount ?? 0)}</div>
                          <RefundBadge status={booking.refundStatus ?? "NONE"} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={!canCancel}
                            onClick={() => setCancelTarget(booking.id)}
                          >
                            Force Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              booking.refundStatus !== "PENDING" ||
                              busyId === `refund:${booking.id}`
                            }
                            onClick={() => handleRefundComplete(booking.id)}
                          >
                            {busyId === `refund:${booking.id}` ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              "Mark Refund Complete"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3 text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <strong className="text-foreground">
                  {rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
                </strong>
                -
                <strong className="text-foreground">
                  {Math.min(rows.length, safePage * PAGE_SIZE)}
                </strong>{" "}
                of {rows.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Prev
                </Button>
                <span className="font-semibold text-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(bookingToCancel)}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force cancel booking</DialogTitle>
            <DialogDescription>
              Admin cancellation also requires a reason of at least 10 characters.
            </DialogDescription>
          </DialogHeader>
          {bookingToCancel ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm">
                <div className="font-semibold text-foreground">{bookingToCancel.id}</div>
                <div className="mt-1 text-muted-foreground">{bookingToCancel.customerName}</div>
                <div className="mt-1 text-muted-foreground">
                  Refund preview:{" "}
                  {formatMoney(
                    Math.round(bookingToCancel.totalPrice * refundRate(bookingToCancel)),
                  )}
                </div>
              </div>
              <Textarea
                rows={5}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why this booking must be force cancelled."
              />
              <div className="text-right text-xs text-muted-foreground">
                {reason.trim().length}/10
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Back
            </Button>
            <Button
              variant="destructive"
              disabled={
                reason.trim().length < 10 ||
                !bookingToCancel ||
                busyId === `cancel:${bookingToCancel?.id}`
              }
              onClick={handleForceCancel}
            >
              {busyId === `cancel:${bookingToCancel?.id}` ? "Cancelling..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Cancelled"
        ? "bg-rose-100 text-rose-700"
        : status === "Checked-in"
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700";
  return <Badge className={tone}>{status}</Badge>;
}

function RefundBadge({ status }: { status: "NONE" | "PENDING" | "COMPLETED" }) {
  if (status === "COMPLETED")
    return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
  if (status === "PENDING") return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
  return <Badge className="bg-slate-100 text-slate-600">None</Badge>;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function refundRate(booking: { dateISO: string; timeSlot: string }) {
  const hoursBefore =
    (new Date(`${booking.dateISO} ${booking.timeSlot}`).getTime() - Date.now()) / 3600000;
  if (hoursBefore > 24) return 1;
  if (hoursBefore >= 2) return 0.5;
  return 0;
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 200));
}
