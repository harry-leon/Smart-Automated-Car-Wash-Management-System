import { createFileRoute } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/role-layouts";

export const Route = createFileRoute("/customer")({
  component: () => <CustomerLayout />,
});
