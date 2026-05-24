import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/app/modules/public-auth/pages/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
