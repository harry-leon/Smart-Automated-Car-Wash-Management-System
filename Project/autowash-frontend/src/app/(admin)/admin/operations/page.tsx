import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminOperationsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Admin operations"
      description="Operations dashboard shell for queue metrics and wash session oversight."
      endpoints={[
        "GET /admin/operations/dashboard",
        "PUT /admin/operations/wash-sessions/:sessionId/status"
      ]}
    />
  );
}
