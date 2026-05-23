import { InternalLoginForm } from "@/components/internal/InternalLoginForm";

export default function StaffLoginPage() {
  return (
    <InternalLoginForm
      expectedRole="staff"
      title="Staff Login"
      redirectTo="/staff/dashboard"
    />
  );
}
