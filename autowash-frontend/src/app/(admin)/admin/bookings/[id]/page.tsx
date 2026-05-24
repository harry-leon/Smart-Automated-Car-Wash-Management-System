import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title={`Admin booking ${params.id}`}
      description="Booking detail shell for assigning staff and creating wash sessions."
      endpoints={["GET /admin/bookings/:bookingId", "POST /operations/wash-sessions"]}
    />
  );
}
