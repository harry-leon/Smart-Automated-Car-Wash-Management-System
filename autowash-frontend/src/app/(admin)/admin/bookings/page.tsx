import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminBookingsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Admin bookings"
      description="Booking management shell with full filters and pagination."
      endpoints={["GET /admin/bookings"]}
    />
  );
}
