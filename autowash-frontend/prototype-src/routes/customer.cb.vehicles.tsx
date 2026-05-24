import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/cb/vehicles")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/customer/vehicles", search });
  },
});
