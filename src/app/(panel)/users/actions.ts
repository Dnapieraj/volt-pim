"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/current-user";
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

async function requireAdmin(): Promise<UserActionState | { userId: string }> {
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
  return { userId: user.id };
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

  revalidatePath("/users");
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

  revalidatePath("/users");

  if (parsed.data.id === admin.userId && parsed.data.role !== "ADMIN") {
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

  const result = await deleteManagedUser(id, admin.userId);
  if (!result.ok) return { error: result.error, success: "" };

  revalidatePath("/users");
  return emptyUserState;
}
