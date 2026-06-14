import { StaffOperationsFlow } from "@/features/staff/operations/components/staff-operations-flow";

type PageProps = {
  searchParams: { sessionId?: string };
};

export default function StaffOperationsPage({ searchParams }: PageProps) {
  return <StaffOperationsFlow mode="board" sessionId={searchParams.sessionId} />;
}
