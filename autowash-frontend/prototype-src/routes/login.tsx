import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/modules/public-auth/pages/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
