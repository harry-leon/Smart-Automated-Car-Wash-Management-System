import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function ForgotPasswordPage() {
  return (
    <WorkspacePlaceholder
      workspace="Auth"
      title="Quên mật khẩu"
      description="Khôi phục mật khẩu theo luồng xác thực của hệ thống."
      endpoints={["POST /auth/forgot-password/request", "POST /auth/forgot-password/reset"]}
      links={[{ href: "/login", label: "Back to login" }]}
    />
  );
}
