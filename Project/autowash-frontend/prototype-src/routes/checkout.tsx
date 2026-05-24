import { createFileRoute } from "@tanstack/react-router";
import { RouteRedirect } from "@/components/route-redirect";

export const Route = createFileRoute("/checkout")({
  component: () => <RouteRedirect to="/staff/operations" />,
});
