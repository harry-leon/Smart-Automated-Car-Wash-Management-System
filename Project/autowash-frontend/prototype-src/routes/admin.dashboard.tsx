import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const AdminDashboardPage = lazy(() =>
  import("@/modules/admin-console/pages/AdminDashboardPage").then((mod) => ({
    default: mod.AdminDashboardPage,
  })),
);

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});
