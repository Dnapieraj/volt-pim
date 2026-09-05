"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/current-user";
import {
  canDeleteProducts,
  canWriteProducts,
  type AppRole,
} from "@/lib/permissions";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/catalog";
import {
  formId,
  parseProductForm,
  type ProductActionState,
} from "@/lib/product-input";

async function requirePermission(
  allowed: (role: AppRole) => boolean,
  deniedMessage: string,
): Promise<ProductActionState | null> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie." };
  }
  if (!allowed(user.role)) {
    return { error: deniedMessage };
  }
  return null;
}

function refreshCatalog(id?: string) {
  revalidatePath("/products");
  revalidatePath("/dashboard");
  if (id) {
    revalidatePath(`/products/${id}`);
    revalidatePath(`/products/${id}/edit`);
  }
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const denied = await requirePermission(
    canWriteProducts,
    "Brak uprawnień do tworzenia kart. Twoja rola to podgląd.",
  );
  if (denied) return denied;

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const result = await createProduct(parsed.data);
  if (!result.ok) return { error: result.error };

  refreshCatalog(result.id);
  redirect(`/products/${result.id}`);
}

export async function updateProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const denied = await requirePermission(
    canWriteProducts,
    "Brak uprawnień do edycji kart. Twoja rola to podgląd.",
  );
  if (denied) return denied;

  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const result = await updateProduct(id, parsed.data);
  if (!result.ok) return { error: result.error };

  refreshCatalog(id);
  redirect(`/products/${id}`);
}

export async function deleteProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const denied = await requirePermission(
    canDeleteProducts,
    "Usuwać karty może tylko administrator.",
  );
  if (denied) return denied;

  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const result = await deleteProduct(id);
  if (!result.ok) return { error: result.error };

  refreshCatalog(id);
  redirect("/products");
}
