export type AppRole = "ADMIN" | "EDITOR" | "VIEWER";

export const roleLabel: Record<AppRole, string> = {
  ADMIN: "admin",
  EDITOR: "edytor",
  VIEWER: "podgląd",
};

export function isAppRole(value: unknown): value is AppRole {
  return value === "ADMIN" || value === "EDITOR" || value === "VIEWER";
}

export function canWriteProducts(role: AppRole) {
  return role === "ADMIN" || role === "EDITOR";
}

export function canDeleteProducts(role: AppRole) {
  return role === "ADMIN";
}

export function canImportCatalog(role: AppRole) {
  return canWriteProducts(role);
}

export function canManageUsers(role: AppRole) {
  return role === "ADMIN";
}

export function isCatalogWritePath(pathname: string) {
  if (pathname === "/import" || pathname.startsWith("/import/")) return true;
  if (pathname === "/products/new" || pathname.startsWith("/products/new/")) {
    return true;
  }
  return /^\/products\/[^/]+\/edit\/?$/.test(pathname);
}
