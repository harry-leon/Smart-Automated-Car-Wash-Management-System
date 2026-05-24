import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerHistoryPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Customer history"
      description="Combined customer history shell for bookings, wash sessions, and point transactions."
      endpoints={[
        "GET /customers/bookings",
        "GET /loyalty/transactions",
        "GET /customers/wash-tracking/active"
      ]}
    />
  );
}
