import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const PromotionsPage = lazy(() =>
  import("@/app/modules/admin-console/pages/PromotionsPage").then((mod) => ({
    default: mod.PromotionsPage,
  })),
);

export const Route = createFileRoute("/admin/promotions")({
  component: PromotionsPage,
});
