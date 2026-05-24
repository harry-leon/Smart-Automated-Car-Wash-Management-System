import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

const AdminBookingsPage = lazy(() =>
  import("@/app/modules/admin-console/pages/AdminBookingsPage").then((mod) => ({
    default: mod.AdminBookingsPage,
  })),
);

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookingsPage,
});
