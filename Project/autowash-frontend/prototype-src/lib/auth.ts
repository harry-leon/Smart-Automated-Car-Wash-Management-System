import type { Role } from "@/lib/carwash-store";

export const ROLE_HOME: Record<Role, string> = {
  Customer: "/customer/home",
  Staff: "/staff/dashboard",
  Admin: "/admin/dashboard",
};

export function getHomePath(role: Role) {
  return ROLE_HOME[role];
}
