import type { ReactNode } from "react";
import { CustomerWorkspaceShell } from "@/components/auth/customer-workspace-shell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CustomerWorkspaceShell>{children}</CustomerWorkspaceShell>;
}
