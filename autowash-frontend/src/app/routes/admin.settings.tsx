import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const SettingsPage = lazy(() =>
  import("@/app/modules/admin-console/pages/SettingsPage").then((mod) => ({
    default: mod.SettingsPage,
  })),
);

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});
