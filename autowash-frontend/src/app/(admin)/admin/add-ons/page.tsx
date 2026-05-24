import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminAddOnsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Add-ons"
      description="Add-on service management shell."
      endpoints={["GET /admin/add-ons", "POST /admin/add-ons"]}
    />
  );
}
