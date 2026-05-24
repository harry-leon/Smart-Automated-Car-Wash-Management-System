import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/modules/public-auth/pages/RegisterPage";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
