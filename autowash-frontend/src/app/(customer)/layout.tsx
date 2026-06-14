import type { ReactNode } from "react";
import { RoleWorkspaceShell } from "@/shared/components/workspace/role-workspace-shell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <RoleWorkspaceShell requiredRole="CUSTOMER">{children}</RoleWorkspaceShell>;
}
