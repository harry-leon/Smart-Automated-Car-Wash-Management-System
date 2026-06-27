import { AdminCustomerDetailPageContent } from "@/features/customers/components/admin-customer-detail-page";

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return <AdminCustomerDetailPageContent customerId={params.id} />;
}
