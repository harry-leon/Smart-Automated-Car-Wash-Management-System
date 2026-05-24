import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerPromotionsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Promotions"
      description="Customer promotion list shell."
      endpoints={["GET /promotions/active"]}
    />
  );
}
