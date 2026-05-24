import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerLoyaltyPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Loyalty"
      description="Loyalty account shell for tier, balance, thresholds, and expiry warnings."
      endpoints={["GET /loyalty/account"]}
      links={[
        { href: "/customer/loyalty/redeem", label: "Redeem points" },
        { href: "/customer/loyalty/history", label: "Point history" }
      ]}
    />
  );
}
