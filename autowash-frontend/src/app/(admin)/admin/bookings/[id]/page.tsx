import { StaffOperationsFlow } from "@/components/staff-operations/staff-operations-flow";

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  return <StaffOperationsFlow mode="session" sessionId={params.id} />;
}
