import { lazy } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";

const CustomerDetailPage = lazy(() =>
  import("@/app/modules/admin-console/pages/CustomerDetailPage").then((mod) => ({
    default: mod.CustomerDetailPage,
  })),
);

export const Route = createFileRoute("/admin/customers/$id")({
  component: CustomerDetailRoute,
});

function CustomerDetailRoute() {
  const { id } = useParams({ from: "/admin/customers/$id" });
  const navigate = useNavigate();
  return <CustomerDetailPage customerId={id} onBack={() => navigate({ to: "/admin/customers" })} />;
}
