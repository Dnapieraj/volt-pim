"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import {
  createProduct,
  deleteProduct,
  getProductById,
  setProductImagePath,
  updateProduct,
} from "@/lib/catalog";
import { getSessionUser, type SessionUser } from "@/lib/current-user";
import {
  canDeleteProducts,
  canWriteProducts,
  type AppRole,
} from "@/lib/permissions";
import {
  applyProductImage,
  deleteManagedImage,
  readProductImageUpload,
} from "@/lib/product-image";
import {
  formId,
  parseProductForm,
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

  const image = await readProductImageUpload(formData);
  if (!image.ok) return { error: image.error };

  const result = await createProduct(parsed.data);
  if (!result.ok) return { error: result.error };

  if (image.intent === "replace") {
    const saved = await applyProductImage(result.id, "", image);
    if (saved.ok && saved.imagePath) {
      await setProductImagePath(result.id, saved.imagePath);
    }
  }

  await recordAudit({
    actor: actor.user,
    action: "CREATE",
    sku: parsed.data.sku,
    productName: parsed.data.name,
    summary:
      image.intent === "replace"
        ? `Nowa karta ${parsed.data.sku} ze zdjęciem`
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

  const image = await readProductImageUpload(formData);
  if (!image.ok) return { error: image.error };

  const existing = await getProductById(id);
  const result = await updateProduct(id, parsed.data);
  if (!result.ok) return { error: result.error };

  if (image.intent !== "keep") {
    const saved = await applyProductImage(
      id,
      existing?.imagePath ?? "",
      image,
    );
    if (!saved.ok) return { error: saved.error };
    await setProductImagePath(id, saved.imagePath);
  }

  const photoNote =
    image.intent === "replace"
      ? " · nowe zdjęcie"
      : image.intent === "remove"
        ? " · usunięto zdjęcie"
        : "";

  await recordAudit({
    actor: actor.user,
    action: "UPDATE",
    sku: parsed.data.sku,
    productName: parsed.data.name,
    summary: `Zapisano zmiany w karcie ${parsed.data.sku}${photoNote}`,
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
