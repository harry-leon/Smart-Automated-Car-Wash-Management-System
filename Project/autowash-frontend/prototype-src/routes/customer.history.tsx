import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History, MessageSquareWarning, Star, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCarwashStore, type Booking } from "@/lib/carwash-store";

export const Route = createFileRoute("/customer/history")({
  component: CustomerHistoryPage,
});

function CustomerHistoryPage() {
  const {
    currentCustomerId,
    customers,
    bookings,
    reviews,
    customerVouchers,
    cancelBookingWithRefund,
    submitReview,
  } = useCarwashStore();
  const [activeTab, setActiveTab] = React.useState("bookings");
  const [cancelBookingId, setCancelBookingId] = React.useState<string | null>(null);
  const [reviewBookingId, setReviewBookingId] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [reviewComment, setReviewComment] = React.useState("");
  const [selectedStars, setSelectedStars] = React.useState(0);
  const [submitting, setSubmitting] = React.useState<null | "cancel" | "review">(null);

  const currentCustomer = customers.find((item) => item.id === currentCustomerId) ?? customers[0];
  const customerBookings = React.useMemo(
    () =>
      bookings
        .filter((booking) => booking.customerId === currentCustomerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookings, currentCustomerId],
  );
  const customerReviews = React.useMemo(
    () => reviews.filter((review) => review.customerId === currentCustomerId),
    [currentCustomerId, reviews],
  );
  const customerWalletEntries = React.useMemo(
    () =>
      customerBookings
        .filter(
          (booking) => booking.refundStatus === "COMPLETED" && (booking.refundAmount ?? 0) > 0,
        )
        .map((booking) => ({
          id: booking.id,
          amount: booking.refundAmount ?? 0,
          date: booking.cancelledAt ?? booking.createdAt,
          reason: booking.cancelReason ?? "Refund completed",
        })),
    [customerBookings],
  );
  const myVouchers = React.useMemo(
    () => customerVouchers.filter((voucher) => voucher.customerId === currentCustomerId),
    [currentCustomerId, customerVouchers],
  );

  const bookingToCancel =
    customerBookings.find((booking) => booking.id === cancelBookingId) ?? null;
  const bookingToReview =
    customerBookings.find((booking) => booking.id === reviewBookingId) ?? null;

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      setSubmitting("cancel");
      await delay();
      const result = cancelBookingWithRefund(bookingToCancel.id, "Customer", cancelReason);
      toast.success(`Booking cancelled. Refund ${formatMoney(result.refundAmount)}.`);
      setCancelBookingId(null);
      setCancelReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel booking.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!bookingToReview) return;
    try {
      setSubmitting("review");
      await delay();
      const review = submitReview({
        bookingId: bookingToReview.id,
        starRating: selectedStars,
        comment: reviewComment,
      });
      toast.success(
        review.isFlagged
          ? "Review submitted and flagged for admin follow-up."
          : "Review submitted successfully.",
      );
      setReviewBookingId(null);
      setSelectedStars(0);
      setReviewComment("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit review.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <History className="h-3.5 w-3.5" /> Customer history
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Bookings, reviews, and refund wallet
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Cancel valid bookings, leave one review per completed wash, and track refunds that came
            back to your wallet.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Wallet balance"
            value={formatMoney(currentCustomer.walletBalance ?? 0)}
          />
          <MetricCard label="Completed reviews" value={`${customerReviews.length}`} />
          <MetricCard label="My vouchers" value={`${myVouchers.length}`} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            {customerBookings.length === 0 ? (
              <EmptyState message="No customer bookings yet. New confirmed bookings will appear here." />
            ) : (
              customerBookings.map((booking) => {
                const review = customerReviews.find((item) => item.bookingId === booking.id);
                const canCancel = booking.status === "Pending" || booking.status === "Confirmed";
                const canReview = booking.status === "Completed" && !review;

                return (
                  <Card key={booking.id} className="rounded-xl shadow-md">
                    <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-lg font-semibold text-foreground">{booking.id}</div>
                          <BookingStatusBadge booking={booking} />
                          <RefundStatusBadge booking={booking} />
                        </div>
                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                          <Info
                            label="Vehicle"
                            value={`${booking.vehicleName} / ${booking.vehiclePlate}`}
                          />
                          <Info label="Service" value={booking.services.join(", ")} />
                          <Info label="Schedule" value={formatDateTime(booking)} />
                          <Info label="Amount paid" value={formatMoney(booking.totalPrice)} />
                          <Info
                            label="Assigned staff"
                            value={booking.assignedStaffName ?? "Auto assign on operations flow"}
                          />
                          <Info
                            label="Cancel log"
                            value={
                              booking.cancelledBy
                                ? `${booking.cancelledBy}: ${booking.cancelReason ?? "—"}`
                                : "—"
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="destructive"
                          disabled={!canCancel}
                          onClick={() => setCancelBookingId(booking.id)}
                        >
                          Hủy lịch
                        </Button>
                        <Button
                          variant="outline"
                          disabled={!canReview}
                          onClick={() => setReviewBookingId(booking.id)}
                        >
                          {review ? "Đã đánh giá" : "Đánh giá ngay"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {customerReviews.length === 0 ? (
              <EmptyState message="No reviews yet. Completed washes can be reviewed once." />
            ) : (
              customerReviews.map((review) => (
                <Card key={review.id} className="rounded-xl shadow-md">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold">{review.bookingId}</div>
                        <div className="text-sm text-muted-foreground">
                          Staff: {review.staffName}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stars value={review.starRating} readOnly />
                        {review.isFlagged ? (
                          <Badge variant="destructive" className="gap-1">
                            <MessageSquareWarning className="h-3.5 w-3.5" />
                            Flagged
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment ?? "No comment."}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4 text-primary" />
                  Refund wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  Current wallet balance:{" "}
                  <strong>{formatMoney(currentCustomer.walletBalance ?? 0)}</strong>
                </div>
                {customerWalletEntries.length === 0 ? (
                  <EmptyState message="No refund has been credited yet." />
                ) : (
                  customerWalletEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 p-4"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{entry.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleString()}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{entry.reason}</div>
                      </div>
                      <div className="text-right font-semibold text-emerald-600">
                        +{formatMoney(entry.amount)}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CancelBookingDialog
        booking={bookingToCancel}
        open={Boolean(bookingToCancel)}
        reason={cancelReason}
        submitting={submitting === "cancel"}
        onReasonChange={setCancelReason}
        onOpenChange={(open) => {
          if (!open) {
            setCancelBookingId(null);
            setCancelReason("");
          }
        }}
        onConfirm={handleCancelBooking}
      />

      <ReviewDialog
        booking={bookingToReview}
        open={Boolean(bookingToReview)}
        stars={selectedStars}
        comment={reviewComment}
        submitting={submitting === "review"}
        onStarsChange={setSelectedStars}
        onCommentChange={setReviewComment}
        onOpenChange={(open) => {
          if (!open) {
            setReviewBookingId(null);
            setSelectedStars(0);
            setReviewComment("");
          }
        }}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}

function CancelBookingDialog({
  booking,
  open,
  reason,
  submitting,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: {
  booking: Booking | null;
  open: boolean;
  reason: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const refundPreview = booking ? Math.round(booking.totalPrice * refundRate(booking)) : 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogDescription>
            Review the refund preview and enter at least 10 characters explaining why you are
            cancelling.
          </DialogDescription>
        </DialogHeader>
        {booking ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm">
              <div className="font-semibold text-foreground">{booking.id}</div>
              <div className="mt-1 text-muted-foreground">{booking.services.join(", ")}</div>
              <div className="mt-1 text-muted-foreground">{formatDateTime(booking)}</div>
              <div className="mt-3 font-semibold text-emerald-600">
                Refund preview: {formatMoney(refundPreview)}
              </div>
            </div>
            <div className="space-y-2">
              <Textarea
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
                placeholder="Please tell us why you need to cancel this booking."
                rows={5}
              />
              <div className="text-right text-xs text-muted-foreground">
                {reason.trim().length}/10
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button
            variant="destructive"
            disabled={reason.trim().length < 10 || submitting}
            onClick={onConfirm}
          >
            {submitting ? "Cancelling..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({
  booking,
  open,
  stars,
  comment,
  submitting,
  onStarsChange,
  onCommentChange,
  onOpenChange,
  onSubmit,
}: {
  booking: Booking | null;
  open: boolean;
  stars: number;
  comment: string;
  submitting: boolean;
  onStarsChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review completed wash</DialogTitle>
          <DialogDescription>
            One review is allowed per booking. Ratings of 1-2 stars are escalated to admin.
          </DialogDescription>
        </DialogHeader>
        {booking ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm">
              <div className="font-semibold text-foreground">{booking.id}</div>
              <div className="mt-1 text-muted-foreground">{booking.services.join(", ")}</div>
              <div className="mt-1 text-muted-foreground">
                Staff: {booking.assignedStaffName ?? "—"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Star rating</div>
              <Stars value={stars} onChange={onStarsChange} />
            </div>
            <Textarea
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="Optional comment"
              rows={5}
            />
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={stars === 0 || submitting} onClick={onSubmit}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stars({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={readOnly ? "" : "transition-transform hover:scale-110"}
        >
          <Star
            className={`h-5 w-5 ${
              star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardContent className="p-6">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function BookingStatusBadge({ booking }: { booking: Booking }) {
  const tone =
    booking.status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : booking.status === "Cancelled"
        ? "bg-rose-100 text-rose-700"
        : booking.status === "Checked-in"
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700";
  return <Badge className={tone}>{booking.status}</Badge>;
}

function RefundStatusBadge({ booking }: { booking: Booking }) {
  const status = booking.refundStatus ?? "NONE";
  const tone =
    status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "PENDING"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return <Badge className={tone}>Refund {status}</Badge>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardContent className="p-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

function refundRate(booking: Booking) {
  const hoursBefore =
    (new Date(`${booking.dateISO} ${booking.timeSlot}`).getTime() - Date.now()) / 3600000;
  if (hoursBefore > 24) return 1;
  if (hoursBefore >= 2) return 0.5;
  return 0;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(booking: Booking) {
  return `${booking.dateISO} ${booking.timeSlot}`;
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 200));
}
