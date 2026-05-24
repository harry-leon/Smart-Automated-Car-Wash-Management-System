import { createFileRoute } from "@tanstack/react-router";
import { RouteRedirect } from "@/components/route-redirect";

export const Route = createFileRoute("/staff/notifications")({
  component: () => <RouteRedirect to="/staff/dashboard" />,
});
