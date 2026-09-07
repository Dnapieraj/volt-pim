"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/audit";
import {
  createCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/categories";
import { getSessionUser, type SessionUser } from "@/lib/current-user";
import { canManageCategories } from "@/lib/permissions";
import { emptyUserState, type UserActionState } from "@/lib/user-input";

async function requireEditor(): Promise<
  UserActionState | { actor: SessionUser }
> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie.", success: "" };
  }
  if (!canManageCategories(user.role)) {
    return {
      error: "Kategorie może zmieniać edytor albo administrator.",
      success: "",
    };
  }
  return { actor: user };
}

function refresh() {
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/audit");
}

export async function createCategoryAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const gate = await requireEditor();
  if ("error" in gate) return gate;

  const name = String(formData.get("name") ?? "");
  const result = await createCategory(name);
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: gate.actor,
    action: "ACCOUNT",
    productName: name.trim(),
    summary: `Dodano kategorię ${name.trim()}`,
  });
  refresh();
  return { error: "", success: "Kategoria została dodana." };
}

export async function renameCategoryAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const gate = await requireEditor();
  if ("error" in gate) return gate;

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "");
  const result = await renameCategory(id, name);
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: gate.actor,
    action: "ACCOUNT",
    productName: name.trim(),
    summary: `Zmieniono nazwę kategorii na ${name.trim()}`,
  });
  refresh();
  return { error: "", success: "Zapisano nazwę kategorii." };
}

export async function deleteCategoryAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const gate = await requireEditor();
  if ("error" in gate) return gate;

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const result = await deleteCategory(id);
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: gate.actor,
    action: "ACCOUNT",
    productName: name,
    summary: `Usunięto kategorię ${name || id}`,
  });
  refresh();
  return emptyUserState;
}
