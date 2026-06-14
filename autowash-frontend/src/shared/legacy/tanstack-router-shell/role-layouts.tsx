import { AppShell } from "@/shared/components/app-shell";
import { RequireRole } from "@/shared/components/route-guards";

export function CustomerLayout() {
  return (
    <RequireRole allowed={["Customer"]}>
      <AppShell role="Customer" />
    </RequireRole>
  );
}

export function StaffLayout() {
  return (
    <RequireRole allowed={["Staff"]}>
      <AppShell role="Staff" />
    </RequireRole>
  );
}

export function AdminLayout() {
  return (
    <RequireRole allowed={["Admin"]}>
      <AppShell role="Admin" />
    </RequireRole>
  );
}
