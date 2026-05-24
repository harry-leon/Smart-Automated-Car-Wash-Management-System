import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminPromotionsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Promotions"
      description="Promotion management shell."
      endpoints={["GET /admin/promotions", "POST /admin/promotions"]}
    />
  );
}
