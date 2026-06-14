import { AdminCustomerDetailPageContent } from "@/features/admin/customers/components/admin-customer-detail-page";

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return <AdminCustomerDetailPageContent customerId={params.id} />;
}
