import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminCustomersPage() {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title="Accounts"
      description="Accounts directory shell for customer, staff, and admin filtering."
      endpoints={["GET /admin/accounts"]}
    />
  );
}
