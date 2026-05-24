import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <WorkspacePlaceholder
      workspace="Admin"
      title={`Customer ${params.id}`}
      description="Customer detail shell with six customer tabs and status management."
      endpoints={[
        "GET /admin/customers/:customerId",
        "GET /admin/customers/:customerId/vehicles",
        "GET /admin/customers/:customerId/bookings",
        "GET /admin/customers/:customerId/wash-sessions",
        "GET /admin/customers/:customerId/point-transactions",
        "GET /admin/customers/:customerId/tier-history",
        "PUT /admin/customers/:customerId/status"
      ]}
    />
  );
}
