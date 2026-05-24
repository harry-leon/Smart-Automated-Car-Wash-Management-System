import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminSettingsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="System settings"
      description="System settings shell for admin configuration."
      endpoints={["GET /admin/settings", "PUT /admin/settings"]}
    />
  );
}
