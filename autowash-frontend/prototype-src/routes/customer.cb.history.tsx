import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/cb/history")({
  beforeLoad: () => {
    throw redirect({ to: "/customer/history" });
  },
});
