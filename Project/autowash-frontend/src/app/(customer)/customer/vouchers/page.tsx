import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerVouchersPage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Vouchers"
      description="Customer voucher wallet shell."
      endpoints={["GET /customers/vouchers"]}
    />
  );
}
