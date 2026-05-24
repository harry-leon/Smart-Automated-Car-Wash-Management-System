import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function StaffDashboardPage() {
  return (
    <WorkspacePlaceholder
      workspace="Staff"
      title="Staff dashboard"
      description="Staff landing shell for operations status and next assigned actions."
      endpoints={["GET /operations/queue"]}
      links={[
        { href: "/staff/operations", label: "Operations queue" },
        { href: "/staff/check-in", label: "Check-in" }
      ]}
    />
  );
}
