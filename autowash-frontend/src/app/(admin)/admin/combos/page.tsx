import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminCombosPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Combos"
      description="Combo package management shell."
      endpoints={["GET /admin/combos", "POST /admin/combos"]}
    />
  );
}
