import type { Role } from "./auth";

export function canManage(role?: Role) {
  return role === "OWNER" || role === "MANAGER";
}

export function canDeleteOwnerOnly(role?: Role) {
  return role === "OWNER";
}

export function canAdminUsers(role?: Role) {
  return role === "OWNER";
}

export function canCreateSales(role?: Role) {
  return role === "OWNER" || role === "MANAGER" || role === "STAFF";
}
