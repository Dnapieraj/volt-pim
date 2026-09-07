"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import {
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  duplicateProduct,
  getProductById,
  replaceProductGallery,
  updateProduct,
} from "@/lib/catalog";
import { getSessionUser, type SessionUser } from "@/lib/current-user";
import {
  canDeleteProducts,
  canWriteProducts,
  type AppRole,
} from "@/lib/permissions";
import {
  copyManagedImage,
  deleteManagedImage,
  galleryWouldOverflow,
  readNewProductImages,
  readRemovedImageIds,
  writeManagedImage,
} from "@/lib/product-image";
import type { ProductStatus } from "@/lib/product";
import {
  emptyBulkState,
  formId,
  parseProductForm,
  type BulkActionState,
  type ProductActionState,
} from "@/lib/product-input";

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

async function saveGallery(
  productId: string,
  current: { id: string; path: string }[],
  formData: FormData,
): Promise<{ ok: true; added: number; removed: number } | { ok: false; error: string }> {
  const added = await readNewProductImages(formData);
  if (!added.ok) return added;

  const removeIds = new Set(readRemovedImageIds(formData));
  const kept = current.filter((image) => !removeIds.has(image.id));
  if (galleryWouldOverflow(kept.length, added.files.length)) {
    return {
      ok: false,
      error: "Na karcie może być maksymalnie 5 zdjęć.",
    };
  }

  for (const image of current) {
    if (removeIds.has(image.id)) {
      await deleteManagedImage(image.path);
    }
  }

  const next = [...kept.map((image) => ({ path: image.path }))];
  for (const file of added.files) {
    const saved = await writeManagedImage(productId, file.buffer, file.ext);
    if (!saved.ok) return saved;
    next.push({ path: saved.imagePath });
  }

  const written = await replaceProductGallery(productId, next);
  if (!written.ok) return written;
  return { ok: true, added: added.files.length, removed: removeIds.size };
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

  const photos = await readNewProductImages(formData);
  if (!photos.ok) return { error: photos.error };
  if (galleryWouldOverflow(0, photos.files.length)) {
    return { error: "Na karcie może być maksymalnie 5 zdjęć." };
  }

  const result = await createProduct(parsed.data);
  if (!result.ok) return { error: result.error };

  const gallery = await saveGallery(result.id, [], formData);
  if (!gallery.ok) return { error: gallery.error };

  await recordAudit({
    actor: actor.user,
    action: "CREATE",
    sku: parsed.data.sku,
    productName: parsed.data.name,
    summary:
      gallery.added > 0
        ? `Nowa karta ${parsed.data.sku} ze zdjęciami (${gallery.added})`
        : `Nowa karta ${parsed.data.sku}`,
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

  const existing = await getProductById(id);
  const result = await updateProduct(id, parsed.data);
  if (!result.ok) return { error: result.error };

  const gallery = await saveGallery(id, existing?.images ?? [], formData);
  if (!gallery.ok) return { error: gallery.error };

  const photoBits = [
    gallery.added ? `+${gallery.added} zdj.` : "",
    gallery.removed ? `−${gallery.removed} zdj.` : "",
  ].filter(Boolean);

  await recordAudit({
    actor: actor.user,
    action: "UPDATE",
    sku: parsed.data.sku,
    productName: parsed.data.name,
    summary: `Zapisano zmiany w karcie ${parsed.data.sku}${
      photoBits.length ? ` · ${photoBits.join(" ")}` : ""
    }`,
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

  for (const image of existing?.images ?? []) {
    await deleteManagedImage(image.path);
  }
  if (existing?.imagePath) {
    await deleteManagedImage(existing.imagePath);
  }

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
    "Brak uprawnień do edycji kart. Twoja rola to podgląd.",
  );
  if ("error" in actor) return { error: actor.error, message: "" };

  const ids = formData
    .getAll("ids")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const statusRaw = String(formData.get("bulkStatus") ?? "").trim();
  const category = String(formData.get("bulkCategory") ?? "").trim();
  const status =
    statusRaw === "ACTIVE" || statusRaw === "DRAFT" || statusRaw === "ARCHIVED"
      ? (statusRaw as ProductStatus)
      : undefined;

  const result = await bulkUpdateProducts(ids, {
    status,
    category: category || undefined,
  });
  if (!result.ok) return { error: result.error, message: "" };

  const bits = [
    status ? `status ${status}` : "",
    category ? `kategoria ${category}` : "",
  ].filter(Boolean);

  await recordAudit({
    actor: actor.user,
    action: "BULK_UPDATE",
    sku: result.skus.slice(0, 8).join(", "),
    summary: `Zbiorczo zmieniono ${result.count} kart (${bits.join(", ")}): ${result.skus.join(", ")}`,
  });

  refreshCatalog();
  return {
    ...emptyBulkState,
    message: `Zapisano ${result.count} kart.`,
  };
}

export async function duplicateProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const actor = await requireActor(
    canWriteProducts,
    "Brak uprawnień do kopiowania kart. Twoja rola to podgląd.",
  );
  if ("error" in actor) return actor;

  const id = formId(formData);
  if (!id) return { error: "Brak identyfikatora karty." };

  const existing = await getProductById(id);
  const result = await duplicateProduct(id);
  if (!result.ok) return { error: result.error };

  const copied: { path: string }[] = [];
  for (const image of existing?.images ?? []) {
    const saved = await copyManagedImage(result.id, image.path);
    if (!saved.ok) return { error: saved.error };
    if (saved.imagePath) copied.push({ path: saved.imagePath });
  }
  if (copied.length) {
    const gallery = await replaceProductGallery(result.id, copied);
    if (!gallery.ok) return { error: gallery.error };
  }

  await recordAudit({
    actor: actor.user,
    action: "CREATE",
    sku: existing ? `${existing.sku}-KOPIA` : result.id,
    productName: existing?.name ?? "",
    summary: `Zduplikowano kartę ${existing?.sku ?? id}`,
  });

  refreshCatalog(result.id);
  redirect(`/products/${result.id}/edit`);
}
