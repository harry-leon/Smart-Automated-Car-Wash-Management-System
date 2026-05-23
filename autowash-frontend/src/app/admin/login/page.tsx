import { InternalLoginForm } from "@/components/internal/InternalLoginForm";

export default function AdminLoginPage() {
  return (
    <InternalLoginForm
      expectedRole="admin"
      title="Admin Login"
      redirectTo="/admin/dashboard"
    />
  );
}
