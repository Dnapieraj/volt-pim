"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { getSessionUser, type SessionUser } from "@/lib/current-user";
import { canManageUsers, isAppRole } from "@/lib/permissions";
import {
  createUserSchema,
  emptyUserState,
  updateUserSchema,
  type UserActionState,
} from "@/lib/user-input";
import {
  createManagedUser,
  deleteManagedUser,
  updateManagedUser,
} from "@/lib/users";

async function requireAdmin(): Promise<UserActionState | { user: SessionUser }> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie.", success: "" };
  }
  if (!canManageUsers(user.role)) {
    return {
      error: "Kontami może zarządzać tylko administrator.",
      success: "",
    };
  }
  return { user };
}

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Sprawdź dane i spróbuj ponownie.";
}

export async function createUserAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), success: "" };
  }
  if (!isAppRole(parsed.data.role)) {
    return { error: "Nieprawidłowa rola.", success: "" };
  }

  const result = await createManagedUser({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    role: parsed.data.role,
  });
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: admin.user,
    action: "ACCOUNT",
    productName: parsed.data.email,
    summary: `Utworzono konto ${parsed.data.email} z rolą ${parsed.data.role}`,
  });

  revalidatePath("/users");
  revalidatePath("/audit");
  return { error: "", success: "Konto zostało utworzone." };
}

export async function updateUserAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const parsed = updateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), success: "" };
  }
  if (!isAppRole(parsed.data.role)) {
    return { error: "Nieprawidłowa rola.", success: "" };
  }

  const result = await updateManagedUser(parsed.data.id, {
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    role: parsed.data.role,
  });
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: admin.user,
    action: "ACCOUNT",
    productName: parsed.data.email,
    summary: `Zmieniono konto ${parsed.data.email} (rola ${parsed.data.role}${parsed.data.password ? ", nowe hasło" : ""})`,
  });

  revalidatePath("/users");
  revalidatePath("/audit");

  if (parsed.data.id === admin.user.id && parsed.data.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return { error: "", success: "Zapisano zmiany konta." };
}

export async function deleteUserAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Brak identyfikatora konta.", success: "" };

  const result = await deleteManagedUser(id, admin.user.id);
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: admin.user,
    action: "ACCOUNT",
    summary: `Usunięto konto ${id}`,
  });

  revalidatePath("/users");
  revalidatePath("/audit");
  return emptyUserState;
}
