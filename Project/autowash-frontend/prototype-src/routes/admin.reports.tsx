import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const ReportsPage = lazy(() =>
  import("@/modules/admin-console/pages/ReportsPage").then((mod) => ({
    default: mod.ReportsPage,
  })),
);

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});
