import type { Role } from "@/shared/store/carwash-store";

export const ROLE_HOME: Record<Role, string> = {
  Customer: "/customer",
  Staff: "/staff",
  Admin: "/admin",
};

export function getHomePath(role: Role) {
  return ROLE_HOME[role];
}
