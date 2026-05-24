import { createFileRoute } from "@tanstack/react-router";
import { StaffLayout } from "@/components/role-layouts";

export const Route = createFileRoute("/staff")({
  component: () => <StaffLayout />,
});
