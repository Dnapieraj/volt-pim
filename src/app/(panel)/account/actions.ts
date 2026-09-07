"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/audit";
import { getSessionUser } from "@/lib/current-user";
import { accountSchema, type UserActionState } from "@/lib/user-input";
import { updateOwnAccount } from "@/lib/users";

export async function updateAccountAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie.", success: "" };
  }

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sprawdź dane.",
      success: "",
    };
  }

  const result = await updateOwnAccount(user.id, parsed.data);
  if (!result.ok) return { error: result.error, success: "" };

  await recordAudit({
    actor: { ...user, name: parsed.data.name },
    action: "ACCOUNT",
    productName: user.email,
    summary: parsed.data.newPassword
      ? `Zmieniono profil i hasło (${user.email})`
      : `Zmieniono imię profilu (${user.email})`,
  });

  revalidatePath("/account");
  revalidatePath("/audit");
  return { error: "", success: "Zapisano profil." };
}
