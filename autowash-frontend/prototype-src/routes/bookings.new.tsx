import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access-denied";
import { RouteRedirect } from "@/components/route-redirect";
import { CustomerBookingForm } from "@/components/customer-booking-form";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";

export const Route = createFileRoute("/bookings/new")({
  component: () => <RouteRedirect to="/customer/bookings" />,
});

export function NewBookingPage() {
  const navigate = useNavigate();
  const { role } = useCarwashStore();

  if (!canAccess(role, ["Customer", "Admin"])) {
    return (
      <div className="p-6 md:p-10">
        <AccessDenied
          title="Booking creation is restricted"
          description="Only Customer and Admin roles can create a new booking from this module."
          role={role}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Create booking
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Booking uses the active customer profile, vehicle data and shop slot validation.
          </p>
        </div>
        <CustomerBookingForm onBooked={() => navigate({ to: "/customer/history" })} />
      </div>
    </div>
  );
}
