import { redirect } from "next/navigation";

export default function AdminPromotionsPage() {
  redirect("/admin/offers?tab=promotions");
}

