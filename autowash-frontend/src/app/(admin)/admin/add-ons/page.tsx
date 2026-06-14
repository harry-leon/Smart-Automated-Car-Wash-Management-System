import { redirect } from "next/navigation";

export default function AdminAddOnsPage() {
  redirect("/admin/services?tab=add-ons");
}
