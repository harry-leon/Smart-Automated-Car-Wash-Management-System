import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/cb/home")({
  beforeLoad: () => {
    throw redirect({ to: "/customer/home" });
  },
});
