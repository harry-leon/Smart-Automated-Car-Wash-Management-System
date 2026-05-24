import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminVouchersPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Vouchers"
      description="Voucher management shell."
      endpoints={["GET /admin/vouchers", "POST /admin/vouchers"]}
    />
  );
}
