"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/catalog";
import {
  emptyActionState,
  formId,
  parseProductForm,
  type ProductActionState,
} from "@/lib/product-input";

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
  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const result = await deleteProduct(id);
  if (!result.ok) return { error: result.error };

  refreshCatalog(id);
  redirect("/products");
}
