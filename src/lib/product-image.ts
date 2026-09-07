import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const PRODUCT_IMAGE_MAX_BYTES = Math.round(1.5 * 1024 * 1024);

const PUBLIC_PREFIX = "/uploads/products/";
const FILE_NAME_RE = /^[a-z0-9]+-\d+\.(jpg|png|webp)$/i;

export type ImageExt = "jpg" | "png" | "webp";

export type ProductImageUpload =
  | { ok: true; intent: "keep" }
  | { ok: true; intent: "remove" }
  | { ok: true; intent: "replace"; buffer: Buffer; ext: ImageExt }
  | { ok: false; error: string };

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

export async function readProductImageUpload(
  formData: FormData,
): Promise<ProductImageUpload> {
  const file = formData.get("image");
  const remove =
    String(formData.get("removeImage") ?? "") === "1" ||
    formData.get("removeImage") === "on";

  if (file instanceof File && file.size > 0) {
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      return { ok: false, error: "Zdjęcie może mieć maksymalnie 1,5 MB." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = sniffImageExt(buffer);
    if (!ext) {
      return {
        ok: false,
        error: "Dozwolone formaty zdjęcia: JPEG, PNG lub WebP.",
      };
    }
    return { ok: true, intent: "replace", buffer, ext };
  }

  if (remove) {
    return { ok: true, intent: "remove" };
  }

  return { ok: true, intent: "keep" };
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
  const name = `${productId}-${Date.now()}.${ext}`;
  await writeFile(join(uploadsDir(), name), buffer);
  return { ok: true as const, imagePath: `${PUBLIC_PREFIX}${name}` };
}

export async function applyProductImage(
  productId: string,
  currentPath: string,
  upload: Extract<ProductImageUpload, { ok: true }>,
): Promise<{ ok: true; imagePath: string } | { ok: false; error: string }> {
  if (upload.intent === "keep") {
    return { ok: true, imagePath: currentPath };
  }

  if (upload.intent === "remove") {
    await deleteManagedImage(currentPath);
    return { ok: true, imagePath: "" };
  }

  try {
    const saved = await writeManagedImage(productId, upload.buffer, upload.ext);
    if (!saved.ok) return saved;
    if (currentPath && currentPath !== saved.imagePath) {
      await deleteManagedImage(currentPath);
    }
    return { ok: true, imagePath: saved.imagePath };
  } catch {
    return { ok: false, error: "Nie udało się zapisać zdjęcia na dysku." };
  }
}
