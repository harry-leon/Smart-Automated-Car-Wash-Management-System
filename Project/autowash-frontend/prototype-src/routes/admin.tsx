import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/role-layouts";

export const Route = createFileRoute("/admin")({
  component: () => <AdminLayout />,
});
