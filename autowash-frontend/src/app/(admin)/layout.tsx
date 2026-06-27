import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/shared/ui/workspace/role-workspace-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleWorkspaceShell requiredRole="ADMIN">{children}</RoleWorkspaceShell>;
}
