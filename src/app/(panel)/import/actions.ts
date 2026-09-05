"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/audit";
import { getSessionUser } from "@/lib/current-user";
import { canImportCatalog } from "@/lib/permissions";
import {
  assertImportFile,
  emptyImportState,
  importCatalog,
  type ImportActionState,
} from "@/lib/import-catalog";

export async function importCatalogAction(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { ...emptyImportState, error: "Sesja wygasła. Zaloguj się ponownie." };
  }
  if (!canImportCatalog(user.role)) {
    return {
      ...emptyImportState,
      error: "Import jest tylko dla edytora i administratora.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ...emptyImportState, error: "Wybierz plik CSV albo XLSX." };
  }

  const checked = assertImportFile(file);
  if (!checked.ok) {
    return { ...emptyImportState, error: checked.error };
  }

  const buffer = await file.arrayBuffer();
  const summary = await importCatalog(buffer);

  await recordAudit({
    actor: user,
    action: "IMPORT",
    productName: file.name,
    summary: `${file.name}: ${summary.created} nowych, ${summary.updated} zaktualizowanych, ${summary.errors.length} z błędami`,
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/import");
  revalidatePath("/audit");

  return {
    error: "",
    created: summary.created,
    updated: summary.updated,
    errors: summary.errors,
  };
}
