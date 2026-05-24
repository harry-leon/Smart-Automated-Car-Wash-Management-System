import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title={`Booking ${params.id}`}
      description="Customer booking detail shell with status and linked wash progress."
      endpoints={["GET /customers/bookings/:bookingId", "GET /customers/wash-tracking/active"]}
    />
  );
}
