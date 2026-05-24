import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const LoyaltyPage = lazy(() =>
  import("@/app/modules/admin-console/pages/LoyaltyPage").then((mod) => ({
    default: mod.LoyaltyPage,
  })),
);

export const Route = createFileRoute("/admin/loyalty")({
  component: LoyaltyPage,
});
