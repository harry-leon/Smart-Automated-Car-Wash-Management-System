import { AdminCustomerDetailPageContent } from "@/features/admin/customers/components/admin-customer-detail-page";

export default function AdminAccountDetailPage({ params }: { params: { id: string } }) {
  return <AdminCustomerDetailPageContent customerId={params.id} />;
}
