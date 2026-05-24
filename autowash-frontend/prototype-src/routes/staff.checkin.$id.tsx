import { createFileRoute } from "@tanstack/react-router";
import { CheckinDetailPage } from "@/modules/staff-operations/routes";

export const Route = createFileRoute("/staff/checkin/$id")({
  component: StaffCheckinRoute,
});

function StaffCheckinRoute() {
  const { id } = Route.useParams();

  return <CheckinDetailPage bookingId={id} />;
}
