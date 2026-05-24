import { Role } from "@/lib/carwash-store";

export type AllowedRole = Role;

export function canAccess(role: Role, allowed: AllowedRole[]) {
  return allowed.includes(role);
}
