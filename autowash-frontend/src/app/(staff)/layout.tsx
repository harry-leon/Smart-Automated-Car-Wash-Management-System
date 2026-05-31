import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/components/workspace/role-workspace-shell";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <RoleWorkspaceShell requiredRole="STAFF">{children}</RoleWorkspaceShell>;
}
