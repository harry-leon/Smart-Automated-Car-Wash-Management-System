import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerCombosPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Combos"
      description="Available combo package shell. This endpoint is public and does not use a customer prefix."
      endpoints={["GET /combos/available"]}
    />
  );
}
