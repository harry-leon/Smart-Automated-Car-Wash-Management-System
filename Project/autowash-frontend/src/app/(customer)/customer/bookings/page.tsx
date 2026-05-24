import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerBookingsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Bookings"
      description="Booking history shell with status, date, and pagination filters."
      endpoints={["GET /customers/bookings"]}
      links={[{ href: "/customer/bookings/new", label: "New booking" }]}
    />
  );
}
