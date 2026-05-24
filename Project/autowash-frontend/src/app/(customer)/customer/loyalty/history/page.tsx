import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function LoyaltyHistoryPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Point history"
      description="Loyalty transaction history shell with transaction type status styling."
      endpoints={["GET /loyalty/transactions"]}
    />
  );
}
