import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function RedeemPointsPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Redeem points"
      description="Voucher redemption shell with the 50-200 point range."
      endpoints={["POST /loyalty/redeem-points"]}
    />
  );
}
