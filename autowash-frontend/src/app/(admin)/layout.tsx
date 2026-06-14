import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/shared/components/workspace/role-workspace-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleWorkspaceShell requiredRole="ADMIN">{children}</RoleWorkspaceShell>;
}
