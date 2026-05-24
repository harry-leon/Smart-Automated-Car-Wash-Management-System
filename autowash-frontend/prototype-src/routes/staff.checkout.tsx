import { createFileRoute } from "@tanstack/react-router";
import { RouteRedirect } from "@/components/route-redirect";

export const Route = createFileRoute("/staff/checkout")({
  component: () => <RouteRedirect to="/staff/operations" />,
});
