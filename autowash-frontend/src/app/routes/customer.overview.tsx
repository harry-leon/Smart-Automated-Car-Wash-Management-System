import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/overview")({
  beforeLoad: () => {
    throw redirect({ to: "/customer/home" });
  },
});
