import { createFileRoute } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { LiveTracker } from "@/components/live-tracker";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";

export const Route = createFileRoute("/bookings/tracker")({
  component: () => <RouteRedirect to="/customer/history/tracker" />,
});

export function BookingTrackerPage() {
  const { role } = useCarwashStore();

  if (!canAccess(role, ["Customer", "Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Tracker access is restricted"
          description="Only Customer and Admin roles can open the booking tracker view."
          role={role}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Booking tracker
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Follow the status chain from pending to checked-in without breaking the main flow.
          </p>
        </div>
        <LiveTracker />
      </div>
    </div>
  );
}
