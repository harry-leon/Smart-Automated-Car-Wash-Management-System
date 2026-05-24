import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function StaffOperationsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Staff"
      title="Operations"
      description="Operations board shell for pending, checked-in, in-progress, and completed sessions."
      endpoints={["GET /operations/queue"]}
    />
  );
}
