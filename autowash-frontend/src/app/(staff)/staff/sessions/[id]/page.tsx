import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function StaffSessionPage({ params }: { params: { id: string } }) {
  return (
    <WorkspacePlaceholder
      workspace="Staff"
      title={`Wash session ${params.id}`}
      description="Wash session detail shell for start, complete, and timer states."
      endpoints={[
        "POST /operations/wash-sessions/:sessionId/start",
        "POST /operations/wash-sessions/:sessionId/complete"
      ]}
      links={[
        { href: "/staff/operations", label: "Back to operations" },
        { href: "/staff/check-in", label: "Check in another vehicle" }
      ]}
    />
  );
}
