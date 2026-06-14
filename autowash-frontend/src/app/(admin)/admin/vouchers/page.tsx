import { redirect } from "next/navigation";

export default function AdminVouchersPage() {
  redirect("/admin/offers?tab=vouchers");
}
