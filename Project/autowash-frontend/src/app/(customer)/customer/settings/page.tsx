import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerSettingsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Customer settings"
      description="Preferences shell for language, theme, and notification settings."
      endpoints={["GET /users/preferences", "PUT /users/preferences"]}
    />
  );
}
