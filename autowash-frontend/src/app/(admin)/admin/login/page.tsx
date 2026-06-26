import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function AdminLoginPage() {
  return (
    <WorkspacePlaceholder
      workspace="Auth"
      title="Admin login"
      description="Admin sign-in shell using the shared auth contract."
      endpoints={["POST /auth/login"]}
      links={[{ href: "/login", label: "Shared login" }]}
    />
  );
}
