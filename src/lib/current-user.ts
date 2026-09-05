import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  canDeleteProducts,
  canImportCatalog,
  canWriteProducts,
  type AppRole,
} from "@/lib/permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.role) return null;
  return {
    id: user.id,
    name: user.name ?? user.email ?? "Konto",
    email: user.email ?? "",
    role: user.role,
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireProductWrite() {
  const user = await requireSessionUser();
  if (!canWriteProducts(user.role)) redirect("/products");
  return user;
}

export async function requireImportAccess() {
  const user = await requireSessionUser();
  if (!canImportCatalog(user.role)) redirect("/products");
  return user;
}

export { canDeleteProducts, canWriteProducts, canImportCatalog };
