import { createFileRoute } from "@tanstack/react-router";
import { AccessDenied } from "@/components/access-denied";
import { BookingPage } from "@/modules/customer-booking/pages/BookingPage";
import { canAccess } from "@/lib/access-control";
import { useCarwashStore } from "@/lib/carwash-store";

export const Route = createFileRoute("/customer/bookings")({
  component: () => <NewBookingPage />,
});

function NewBookingPage() {
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

  return <BookingPage />;
}
