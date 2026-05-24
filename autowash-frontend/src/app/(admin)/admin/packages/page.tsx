import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminPackagesPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Packages"
      description="Wash package management shell."
      endpoints={["GET /admin/packages", "POST /admin/packages"]}
    />
  );
}
