import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const CustomersPage = lazy(() =>
  import("@/modules/admin-console/pages/CustomersPage").then((mod) => ({
    default: mod.CustomersPage,
  })),
);

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});
