import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const WashPackagesPage = lazy(() =>
  import("@/modules/admin-console/pages/WashPackagesPage").then((mod) => ({
    default: mod.WashPackagesPage,
  })),
);

export const Route = createFileRoute("/admin/packages")({
  component: WashPackagesPage,
});
