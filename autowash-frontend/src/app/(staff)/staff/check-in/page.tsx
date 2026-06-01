import { StaffOperationsFlow } from "@/components/staff-operations/staff-operations-flow";

type PageProps = {
  searchParams: { sessionId?: string };
};

export default function StaffCheckInPage({ searchParams }: PageProps) {
  return <StaffOperationsFlow mode="check-in" sessionId={searchParams.sessionId} />;
}
