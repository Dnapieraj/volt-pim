import { copyFile, mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const PRODUCT_IMAGE_MAX_BYTES = Math.round(1.5 * 1024 * 1024);
export const MAX_PRODUCT_IMAGES = 5;

export function galleryWouldOverflow(kept: number, added: number) {
  return kept + added > MAX_PRODUCT_IMAGES;
}

const PUBLIC_PREFIX = "/uploads/products/";
const FILE_NAME_RE = /^[a-z0-9]+-\d+\.(jpg|png|webp)$/i;

export type ImageExt = "jpg" | "png" | "webp";

export type ProductImageRow = { id: string; path: string };

export type NewProductImage = { buffer: Buffer; ext: ImageExt };

export function sniffImageExt(buffer: Buffer): ImageExt | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export function isManagedImagePath(imagePath: string) {
  if (!imagePath.startsWith(PUBLIC_PREFIX)) return false;
  const name = imagePath.slice(PUBLIC_PREFIX.length);
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return false;
  }
  return FILE_NAME_RE.test(name);
}

function uploadsDir() {
  return join(process.cwd(), "public", "uploads", "products");
}

function toFsPath(imagePath: string) {
  return join(uploadsDir(), imagePath.slice(PUBLIC_PREFIX.length));
}

export async function readNewProductImages(
  formData: FormData,
): Promise<{ ok: true; files: NewProductImage[] } | { ok: false; error: string }> {
  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const parsed: NewProductImage[] = [];
  for (const file of files) {
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      return { ok: false, error: "Każde zdjęcie może mieć maksymalnie 1,5 MB." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = sniffImageExt(buffer);
    if (!ext) {
      return {
        ok: false,
        error: "Dozwolone formaty zdjęcia: JPEG, PNG lub WebP.",
      };
    }
    parsed.push({ buffer, ext });
  }
  return { ok: true, files: parsed };
}

export function readRemovedImageIds(formData: FormData) {
  return formData
    .getAll("removeImageId")
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export async function deleteManagedImage(imagePath: string) {
  if (!imagePath || !isManagedImagePath(imagePath)) return;
  try {
    await unlink(toFsPath(imagePath));
  } catch {
    // missing file is fine — the card should still save
  }
}

export async function writeManagedImage(
  productId: string,
  buffer: Buffer,
  ext: ImageExt,
) {
  if (!/^[a-z0-9]+$/i.test(productId)) {
    return { ok: false as const, error: "Nie udało się zapisać zdjęcia." };
  }
  await mkdir(uploadsDir(), { recursive: true });
  const name = `${productId}-${Date.now()}${Math.floor(Math.random() * 1000)}.${ext}`;
  await writeFile(join(uploadsDir(), name), buffer);
  return { ok: true as const, imagePath: `${PUBLIC_PREFIX}${name}` };
}

export async function copyManagedImage(productId: string, sourcePath: string) {
  if (!isManagedImagePath(sourcePath)) return { ok: true as const, imagePath: "" };
  const ext = sourcePath.split(".").pop();
  if (ext !== "jpg" && ext !== "png" && ext !== "webp") {
    return { ok: true as const, imagePath: "" };
  }
  if (!/^[a-z0-9]+$/i.test(productId)) {
    return { ok: false as const, error: "Nie udało się skopiować zdjęcia." };
  }
  try {
    await mkdir(uploadsDir(), { recursive: true });
    const name = `${productId}-${Date.now()}${Math.floor(Math.random() * 1000)}.${ext}`;
    await copyFile(toFsPath(sourcePath), join(uploadsDir(), name));
    return { ok: true as const, imagePath: `${PUBLIC_PREFIX}${name}` };
  } catch {
    return { ok: false as const, error: "Nie udało się skopiować zdjęcia." };
  }
}
