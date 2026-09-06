import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product, ProductStatus } from "@/lib/product";
import type { ProductWriteInput } from "@/lib/product-input";
import {
  deleteImageFiles,
  deleteProductImageFolder,
} from "@/lib/product-images";

export type WriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function mapProduct(row: {
  id: string;
  sku: string;
  ean: string;
  manufacturerCode: string;
  name: string;
  brand: string;
  unit: string;
  price: { toString(): string } | number;
  vat: number;
  stock: number;
  minOrder: number;
  packageQty: number;
  warehouseLocation: string;
  weightKg: { toString(): string } | number;
  voltage: string;
  current: string;
  ipRating: string;
  status: Product["status"];
  description: string;
  notes: string;
  category: { name: string };
  attributes: { key: string; value: string }[];
  substitutes: { substitute: { sku: string } }[];
  images: { id: string; url: string; sortOrder: number }[];
}): Product {
  return {
    id: row.id,
    sku: row.sku,
    ean: row.ean,
    manufacturerCode: row.manufacturerCode,
    name: row.name,
    brand: row.brand,
    category: row.category.name,
    unit: row.unit,
    price: Number(row.price),
    vat: row.vat,
    stock: row.stock,
    minOrder: row.minOrder,
    packageQty: row.packageQty,
    warehouseLocation: row.warehouseLocation,
    weightKg: Number(row.weightKg),
    voltage: row.voltage,
    current: row.current,
    ipRating: row.ipRating,
    status: row.status,
    description: row.description,
    notes: row.notes,
    attributes: row.attributes.map((item) => ({
      key: item.key,
      value: item.value,
    })),
    substitutes: row.substitutes.map((item) => item.substitute.sku),
    images: row.images.map((item) => ({
      id: item.id,
      url: item.url,
      sortOrder: item.sortOrder,
    })),
  };
}

const include = {
  category: true,
  attributes: true,
  substitutes: { include: { substitute: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
} as const;

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include,
    orderBy: { sku: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include,
  });
  return row ? mapProduct(row) : null;
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { sku },
    include,
  });
  return row ? mapProduct(row) : null;
}

export async function getDashboardStats() {
  const [total, active, outOfStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { stock: 0 } }),
  ]);

  return [
    { label: "Produkty w bazie", value: String(total) },
    { label: "Aktywne SKU", value: String(active) },
    { label: "Braki magazynowe", value: String(outOfStock) },
    { label: "Źródło danych", value: "MariaDB" },
  ];
}

export async function getCategoryNames() {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map((row) => row.name);
}

function prismaErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "To SKU już jest w katalogu. Wybierz inne.";
    }
    if (error.code === "P2025") {
      return "Nie znaleziono karty.";
    }
  }
  return "Nie udało się zapisać karty. Spróbuj ponownie.";
}

function productScalars(input: ProductWriteInput, categoryId: string) {
  return {
    sku: input.sku,
    ean: input.ean,
    manufacturerCode: input.manufacturerCode,
    name: input.name,
    brand: input.brand,
    categoryId,
    unit: input.unit,
    price: input.price,
    vat: input.vat,
    stock: input.stock,
    minOrder: input.minOrder,
    packageQty: input.packageQty,
    warehouseLocation: input.warehouseLocation,
    weightKg: input.weightKg,
    voltage: input.voltage,
    current: input.current,
    ipRating: input.ipRating,
    status: input.status,
    description: input.description,
    notes: input.notes,
  };
}

async function resolveCategoryId(name: string) {
  const category = await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return category.id;
}

async function resolveSubstituteIds(skus: string[], ownSku: string) {
  const wanted = [...new Set(skus.filter((sku) => sku && sku !== ownSku))];
  if (wanted.length === 0) {
    return { ok: true as const, ids: [] as string[] };
  }

  const rows = await prisma.product.findMany({
    where: { sku: { in: wanted } },
    select: { id: true, sku: true },
  });
  const found = new Set(rows.map((row) => row.sku));
  const missing = wanted.filter((sku) => !found.has(sku));
  if (missing.length > 0) {
    return {
      ok: false as const,
      error: `Nie ma w katalogu zamienników: ${missing.join(", ")}. Najpierw utwórz te karty.`,
    };
  }

  const bySku = Object.fromEntries(rows.map((row) => [row.sku, row.id]));
  return { ok: true as const, ids: wanted.map((sku) => bySku[sku]) };
}

export async function createProduct(
  input: ProductWriteInput,
): Promise<WriteResult> {
  try {
    const [categoryId, substitutes] = await Promise.all([
      resolveCategoryId(input.category),
      resolveSubstituteIds(input.substitutes, input.sku),
    ]);
    if (!substitutes.ok) return substitutes;

    const row = await prisma.product.create({
      data: {
        ...productScalars(input, categoryId),
        attributes: { create: input.attributes },
        substitutes: {
          create: substitutes.ids.map((substituteId) => ({ substituteId })),
        },
      },
    });
    return { ok: true, id: row.id };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export async function attachProductImages(
  productId: string,
  images: { url: string; sortOrder: number }[],
): Promise<WriteResult> {
  try {
    if (images.length === 0) return { ok: true, id: productId };
    await prisma.productImage.createMany({
      data: images.map((image) => ({
        productId,
        url: image.url,
        sortOrder: image.sortOrder,
      })),
    });
    return { ok: true, id: productId };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export async function removeProductImages(
  productId: string,
  imageIds: string[],
): Promise<WriteResult> {
  try {
    if (imageIds.length === 0) return { ok: true, id: productId };
    const rows = await prisma.productImage.findMany({
      where: { productId, id: { in: imageIds } },
      select: { id: true, url: true },
    });
    if (rows.length === 0) return { ok: true, id: productId };

    await prisma.productImage.deleteMany({
      where: { id: { in: rows.map((row) => row.id) } },
    });
    await deleteImageFiles(rows.map((row) => row.url));
    return { ok: true, id: productId };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export async function countProductImages(productId: string) {
  return prisma.productImage.count({ where: { productId } });
}

export async function updateProduct(
  id: string,
  input: ProductWriteInput,
): Promise<WriteResult> {
  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return { ok: false, error: "Nie znaleziono karty." };
    }

    const [categoryId, substitutes] = await Promise.all([
      resolveCategoryId(input.category),
      resolveSubstituteIds(input.substitutes, input.sku),
    ]);
    if (!substitutes.ok) return substitutes;

    await prisma.$transaction([
      prisma.productAttribute.deleteMany({ where: { productId: id } }),
      prisma.productSubstitute.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...productScalars(input, categoryId),
          attributes: { create: input.attributes },
          substitutes: {
            create: substitutes.ids.map((substituteId) => ({ substituteId })),
          },
        },
      }),
    ]);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export async function deleteProduct(id: string): Promise<WriteResult> {
  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return { ok: false, error: "Nie znaleziono karty." };
    }
    await prisma.product.delete({ where: { id } });
    await deleteProductImageFolder(id);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export type BulkWriteInput = {
  ids: string[];
  status?: ProductStatus;
  category?: string;
};

export async function bulkUpdateProducts(
  input: BulkWriteInput,
): Promise<
  { ok: true; count: number; skus: string[] } | { ok: false; error: string }
> {
  const ids = [...new Set(input.ids.filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false, error: "Zaznacz co najmniej jedną kartę." };
  }
  if (!input.status && !input.category) {
    return { ok: false, error: "Wybierz status albo kategorię do zmiany." };
  }

  try {
    const existing = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, sku: true },
      orderBy: { sku: "asc" },
    });
    if (existing.length === 0) {
      return { ok: false, error: "Nie znaleziono zaznaczonych kart." };
    }

    const data: { status?: ProductStatus; categoryId?: string } = {};
    if (input.status) data.status = input.status;
    if (input.category) {
      data.categoryId = await resolveCategoryId(input.category);
    }

    await prisma.product.updateMany({
      where: { id: { in: existing.map((row) => row.id) } },
      data,
    });

    return {
      ok: true,
      count: existing.length,
      skus: existing.map((row) => row.sku),
    };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}
