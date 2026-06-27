import { redirect } from "next/navigation";
import { AdminOffersManagementPage } from "@/features/management/components/admin-offers-management-page";

export default function AdminOffersPage({
  searchParams,
}: {
  searchParams?: {
    tab?: string;
  };
}) {
  const tab = searchParams?.tab;

  if (tab !== "promotions" && tab !== "vouchers") {
    redirect("/admin/offers?tab=promotions");
  }

  return <AdminOffersManagementPage />;
}
