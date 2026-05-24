import * as React from "react";
import { CheckCircle2, Clock3, ClipboardList, LoaderCircle, TimerReset, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCarwashStore } from "@/lib/carwash-store";

export function OperationsBoardPage() {
  const { bookings, currentStaffId, staffMembers, completeOperationalWash, confirmVehiclePickup } =
    useCarwashStore();
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const [, forceTick] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => forceTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentStaff = staffMembers.find((staff) => staff.id === currentStaffId) ?? staffMembers[0];
  const myBookings = React.useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.assignedStaffId === currentStaff.id ||
          (booking.status === "Checked-in" && !booking.assignedStaffId),
      ),
    [bookings, currentStaff.id],
  );

  const inProgress = myBookings.filter((booking) => booking.washStatus === "In Progress");
  const readyForPickup = myBookings.filter(
    (booking) => booking.status === "Completed" && booking.completedAt && !booking.pickedUpAt,
  );

  const runAction = async (bookingId: string, action: "complete" | "pickup") => {
    try {
      setBusyAction(`${action}:${bookingId}`);
      await delay();
      if (action === "complete") {
        const result = completeOperationalWash(bookingId);
        toast.success(`${result.bookingCode} wash completed.`);
      } else {
        const result = confirmVehiclePickup(bookingId);
        toast.success(`${result.bookingCode} picked up after ${result.waitMinutes} min.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Staff action failed.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
            <ClipboardList className="h-3.5 w-3.5" /> Staff operations
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Wash completion and pickup tracking
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Complete active washes, confirm vehicle pickup, and watch live elapsed wait timers in
            one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Assigned staff" value={currentStaff.name} />
          <MetricCard label="In progress" value={`${inProgress.length}`} />
          <MetricCard label="Waiting pickup" value={`${readyForPickup.length}`} />
        </div>

        <section className="space-y-4">
          <SectionTitle
            title="Active washes"
            description="Vehicles currently being washed by staff."
          />
          {inProgress.length === 0 ? (
            <EmptyState message="No in-progress washes right now." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {inProgress.map((booking) => (
                <Card key={booking.id} className="rounded-xl shadow-md">
                  <CardContent className="space-y-4 p-6">
                    <BookingHeader booking={booking} />
                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                      <InfoRow label="Customer" value={booking.customerName ?? "—"} />
                      <InfoRow label="Service" value={booking.services.join(", ")} />
                      <InfoRow
                        label="Started"
                        value={
                          booking.checkInAt ? new Date(booking.checkInAt).toLocaleString() : "—"
                        }
                      />
                      <InfoRow label="Paid" value={formatMoney(booking.totalPrice)} />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => runAction(booking.id, "complete")}
                      disabled={busyAction === `complete:${booking.id}`}
                    >
                      {busyAction === `complete:${booking.id}` ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Hoàn tất rửa xe
                        </>
                      ) : (
                        "Hoàn tất rửa xe"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionTitle
            title="Waiting for pickup"
            description="Completed washes with a live elapsed timer until the customer collects the vehicle."
          />
          {readyForPickup.length === 0 ? (
            <EmptyState message="No completed washes are waiting for pickup." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {readyForPickup.map((booking) => {
                const waitMinutes = booking.completedAt
                  ? Math.max(
                      0,
                      Math.round((Date.now() - new Date(booking.completedAt).getTime()) / 60000),
                    )
                  : 0;
                const tone =
                  waitMinutes > 30
                    ? "border-rose-200 bg-rose-50"
                    : waitMinutes >= 15
                      ? "border-amber-200 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50";

                return (
                  <Card key={booking.id} className="rounded-xl shadow-md">
                    <CardContent className="space-y-4 p-6">
                      <BookingHeader booking={booking} />
                      <div className={`rounded-xl border p-4 ${tone}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Live waiting timer
                            </div>
                            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                              {waitMinutes} min
                            </div>
                          </div>
                          <ClockToneBadge waitMinutes={waitMinutes} />
                        </div>
                      </div>
                      <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                        <InfoRow
                          label="Wash done at"
                          value={new Date(booking.completedAt!).toLocaleString()}
                        />
                        <InfoRow
                          label="Reminder sent"
                          value={booking.reminderSent ? "Yes" : "No"}
                        />
                        <InfoRow label="Vehicle" value={booking.vehiclePlate} />
                        <InfoRow label="Customer" value={booking.customerName ?? "—"} />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => runAction(booking.id, "pickup")}
                        disabled={busyAction === `pickup:${booking.id}`}
                      >
                        {busyAction === `pickup:${booking.id}` ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Xác nhận lấy xe
                          </>
                        ) : (
                          "Xác nhận lấy xe"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function BookingHeader({
  booking,
}: {
  booking: { id: string; vehicleName: string; vehiclePlate: string; status: string };
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-lg font-semibold text-foreground">{booking.id}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {booking.vehicleName} / {booking.vehiclePlate}
        </div>
      </div>
      <Badge className="bg-blue-100 text-blue-700">{booking.status}</Badge>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function ClockToneBadge({ waitMinutes }: { waitMinutes: number }) {
  if (waitMinutes > 30) {
    return <Badge className="bg-rose-100 text-rose-700">Over 30 min</Badge>;
  }
  if (waitMinutes >= 15) {
    return <Badge className="bg-amber-100 text-amber-700">15-30 min</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-700">Under 15 min</Badge>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TimerReset className="h-4 w-4 text-primary" />
          Queue clear
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 200));
}
