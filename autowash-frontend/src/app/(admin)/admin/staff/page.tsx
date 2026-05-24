import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminStaffPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Staff management"
      description="Staff account management shell."
      endpoints={["GET /admin/staff"]}
    />
  );
}
