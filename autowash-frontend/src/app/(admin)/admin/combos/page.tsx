import { redirect } from "next/navigation";

export default function AdminCombosPage() {
  redirect("/admin/services?tab=combos");
}
