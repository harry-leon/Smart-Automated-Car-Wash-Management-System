import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function NewBookingPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="New booking"
      description="Seven-step booking checkout shell based on the mandatory-first flow."
      endpoints={[
        "GET /customers/vehicles",
        "GET /packages",
        "GET /combos/available",
        "GET /add-ons",
        "POST /bookings/validate-voucher",
        "POST /customers/bookings",
        "POST /bookings/:bookingId/apply-points"
      ]}
    />
  );
}
