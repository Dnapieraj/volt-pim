"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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

async function requireUser(): Promise<ProductActionState | null> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie." };
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
  const denied = await requireUser();
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
  const denied = await requireUser();
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
  const denied = await requireUser();
  if (denied) return denied;

  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const result = await deleteProduct(id);
  if (!result.ok) return { error: result.error };

  refreshCatalog(id);
  redirect("/products");
}
