import { AdminCustomerDetailPageContent } from "@/components/admin-customers/admin-customer-detail-page";

export default function AdminAccountDetailPage({ params }: { params: { id: string } }) {
  return <AdminCustomerDetailPageContent customerId={params.id} />;
}
