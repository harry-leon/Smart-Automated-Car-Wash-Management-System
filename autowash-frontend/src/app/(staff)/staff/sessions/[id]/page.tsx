import { StaffOperationsFlow } from "@/components/staff-operations/staff-operations-flow";

export default function StaffSessionPage({ params }: { params: { id: string } }) {
  return <StaffOperationsFlow mode="session" sessionId={params.id} />;
}
