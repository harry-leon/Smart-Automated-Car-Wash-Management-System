import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function ForgotPasswordPage() {
  return (
    <WorkspacePlaceholder
      workspace="Auth"
      title="Forgot password"
      description="Password recovery shell wired to the auth reset contract."
      endpoints={["POST /auth/forgot-password/request", "POST /auth/forgot-password/reset"]}
      links={[{ href: "/login", label: "Back to login" }]}
    />
  );
}
