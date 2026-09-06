import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile, rm } from "fs/promises";
import path from "path";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PER_PRODUCT = 5;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function uploadsRoot() {
  return path.join(process.cwd(), "public", "uploads", "products");
}

function productDir(productId: string) {
  return path.join(uploadsRoot(), productId);
}

export function maxImagesPerProduct() {
  return MAX_PER_PRODUCT;
}

export function collectImageFiles(formData: FormData): File[] {
  return formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

export function collectRemoveImageIds(formData: FormData): string[] {
  return [
    ...new Set(
      formData
        .getAll("removeImageId")
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];
}

export function validateImageFiles(files: File[]): string | null {
  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return "Dozwolone formaty zdjęć: JPG, PNG, WebP.";
    }
    if (file.size > MAX_BYTES) {
      return "Każde zdjęcie może mieć max 2 MB.";
    }
  }
  return null;
}

export async function saveProductImages(
  productId: string,
  files: File[],
  startOrder: number,
): Promise<{ url: string; sortOrder: number }[]> {
  if (files.length === 0) return [];

  const dir = productDir(productId);
  await mkdir(dir, { recursive: true });

  const saved: { url: string; sortOrder: number }[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const ext = EXT[file.type] ?? ".jpg";
    const filename = `${randomUUID()}${ext}`;
    await writeFile(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer()),
    );
    saved.push({
      url: `/uploads/products/${productId}/${filename}`,
      sortOrder: startOrder + index,
    });
  }
  return saved;
}

export async function deleteImageFiles(urls: string[]) {
  await Promise.all(
    urls.map(async (url) => {
      if (!url.startsWith("/uploads/products/")) return;
      try {
        await unlink(path.join(process.cwd(), "public", url));
      } catch {
        // already gone
      }
    }),
  );
}

export async function deleteProductImageFolder(productId: string) {
  try {
    await rm(productDir(productId), { recursive: true, force: true });
  } catch {
    // folder may not exist
  }
}
