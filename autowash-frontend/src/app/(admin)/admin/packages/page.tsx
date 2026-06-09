import { redirect } from "next/navigation";

export default function AdminPackagesPage() {
  redirect("/admin/services?tab=packages");
}
