import { Role } from "@/shared/store/carwash-store";

export type AllowedRole = Role;

export function canAccess(role: Role, allowed: AllowedRole[]) {
  return allowed.includes(role);
}
