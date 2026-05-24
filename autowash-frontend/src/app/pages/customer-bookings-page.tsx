import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { CustomerHistory } from "@/components/customer-history";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";

export function BookingListPage() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { role } = useCarwashStore();

  if (!canAccess(role, ["Customer", "Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Bookings are restricted"
          description="Only Customer and Admin roles can review customer booking history."
          role={role}
        />
      </div>
    );
  }

  if (pathname !== "/bookings") {
    return <Outlet />;
  }

  return <RouteRedirect to="/customer/history" />;
}

export function CustomerBookingsContent() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Customer bookings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Review current bookings, cancel valid ones and jump to the live tracker.
          </p>
        </div>
        <CustomerHistory onTrack={() => navigate({ to: "/customer/history/tracker" })} />
      </div>
    </div>
  );
}
