"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import {
  attachProductImages,
  bulkUpdateProducts,
  countProductImages,
  createProduct,
  deleteProduct,
  getProductById,
  removeProductImages,
  updateProduct,
} from "@/lib/catalog";
import { getSessionUser, type SessionUser } from "@/lib/current-user";
import {
  canDeleteProducts,
  canWriteProducts,
  type AppRole,
} from "@/lib/permissions";
import {
  formId,
  parseProductForm,
  type ProductActionState,
} from "@/lib/product-input";
import type { ProductStatus } from "@/lib/product";
import {
  collectImageFiles,
  collectRemoveImageIds,
  maxImagesPerProduct,
  saveProductImages,
  validateImageFiles,
} from "@/lib/product-images";

export type BulkActionState = {
  error: string;
  message: string;
};

export const emptyBulkState: BulkActionState = { error: "", message: "" };

async function requireActor(
  allowed: (role: AppRole) => boolean,
  deniedMessage: string,
): Promise<{ user: SessionUser } | { error: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie." };
  }
  if (!allowed(user.role)) {
    return { error: deniedMessage };
  }
  return { user };
}

function refreshCatalog(id?: string) {
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/audit");
  if (id) {
    revalidatePath(`/products/${id}`);
    revalidatePath(`/products/${id}/edit`);
  }
}

async function syncProductImages(
  productId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const removeIds = collectRemoveImageIds(formData);
  if (removeIds.length > 0) {
    const removed = await removeProductImages(productId, removeIds);
    if (!removed.ok) return removed;
  }

  const files = collectImageFiles(formData);
  if (files.length === 0) return { ok: true };

  const invalid = validateImageFiles(files);
  if (invalid) return { ok: false, error: invalid };

  const current = await countProductImages(productId);
  if (current + files.length > maxImagesPerProduct()) {
    return {
      ok: false,
      error: `Na kartę możesz dodać max ${maxImagesPerProduct()} zdjęć.`,
    };
  }

  const saved = await saveProductImages(productId, files, current);
  const attached = await attachProductImages(productId, saved);
  if (!attached.ok) return attached;
  return { ok: true };
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const actor = await requireActor(
    canWriteProducts,
    "Brak uprawnień do tworzenia kart. Twoja rola to podgląd.",
  );
  if ("error" in actor) return actor;

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const files = collectImageFiles(formData);
  const invalid = validateImageFiles(files);
  if (invalid) return { error: invalid };
  if (files.length > maxImagesPerProduct()) {
    return {
      error: `Na kartę możesz dodać max ${maxImagesPerProduct()} zdjęć.`,
    };
  }

  const result = await createProduct(parsed.data);
  if (!result.ok) return { error: result.error };

  const images = await syncProductImages(result.id, formData);
  if (!images.ok) return { error: images.error };

  await recordAudit({
    actor: actor.user,
    action: "CREATE",
    sku: parsed.data.sku,
    productName: parsed.data.name,
    summary: `Nowa karta ${parsed.data.sku}${
      files.length ? ` (+${files.length} zdjęć)` : ""
    }`,
  });

  refreshCatalog(result.id);
  redirect(`/products/${result.id}`);
}

export async function updateProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const actor = await requireActor(
    canWriteProducts,
    "Brak uprawnień do edycji kart. Twoja rola to podgląd.",
  );
  if ("error" in actor) return actor;

  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const result = await updateProduct(id, parsed.data);
  if (!result.ok) return { error: result.error };

  const images = await syncProductImages(id, formData);
  if (!images.ok) return { error: images.error };

  await recordAudit({
    actor: actor.user,
    action: "UPDATE",
    sku: parsed.data.sku,
    productName: parsed.data.name,
    summary: `Zapisano zmiany w karcie ${parsed.data.sku}`,
  });

  refreshCatalog(id);
  redirect(`/products/${id}`);
}

export async function deleteProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const actor = await requireActor(
    canDeleteProducts,
    "Usuwać karty może tylko administrator.",
  );
  if ("error" in actor) return actor;

  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const existing = await getProductById(id);
  const result = await deleteProduct(id);
  if (!result.ok) return { error: result.error };

  await recordAudit({
    actor: actor.user,
    action: "DELETE",
    sku: existing?.sku ?? id,
    productName: existing?.name ?? "",
    summary: `Usunięto kartę ${existing?.sku ?? id}`,
  });

  refreshCatalog(id);
  redirect("/products");
}

export async function bulkUpdateProductsAction(
  _prev: BulkActionState,
  formData: FormData,
): Promise<BulkActionState> {
  const actor = await requireActor(
    canWriteProducts,
    "Brak uprawnień do masowej edycji. Twoja rola to podgląd.",
  );
  if ("error" in actor) return { error: actor.error, message: "" };

  const ids = formData
    .getAll("productId")
    .map((item) => String(item).trim())
    .filter(Boolean);

  const statusRaw = String(formData.get("bulkStatus") ?? "").trim();
  const categoryRaw = String(formData.get("bulkCategory") ?? "").trim();

  const status =
    statusRaw === "ACTIVE" ||
    statusRaw === "DRAFT" ||
    statusRaw === "ARCHIVED"
      ? (statusRaw as ProductStatus)
      : undefined;
  const category =
    categoryRaw && categoryRaw !== "KEEP" ? categoryRaw : undefined;

  const result = await bulkUpdateProducts({ ids, status, category });
  if (!result.ok) return { error: result.error, message: "" };

  const parts: string[] = [];
  if (status) parts.push(`status → ${status}`);
  if (category) parts.push(`kategoria → ${category}`);

  await recordAudit({
    actor: actor.user,
    action: "UPDATE",
    sku: result.skus.slice(0, 3).join(", "),
    productName: `${result.count} kart`,
    summary: `Masowa edycja (${result.count}): ${parts.join(", ")} — ${result.skus.join(", ")}`,
  });

  refreshCatalog();
  return {
    error: "",
    message: `Zaktualizowano ${result.count} kart (${parts.join(", ")}).`,
  };
}
