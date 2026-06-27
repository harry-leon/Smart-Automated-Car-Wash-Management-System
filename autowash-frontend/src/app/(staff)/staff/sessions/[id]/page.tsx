import { StaffOperationsFlow } from "@/features/operations/components/staff-operations-flow";

export default function StaffSessionPage({ params }: { params: { id: string } }) {
  return <StaffOperationsFlow mode="session" sessionId={params.id} />;
}
