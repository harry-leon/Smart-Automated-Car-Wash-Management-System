import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/cb/booking")({
  beforeLoad: () => {
    throw redirect({ to: "/customer/bookings" });
  },
});
