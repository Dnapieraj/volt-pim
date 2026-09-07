import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product, ProductStatus } from "@/lib/product";
import type { ProductWriteInput } from "@/lib/product-input";
import {
  PAGE_SIZE,
  clampPage,
  type CatalogQuery,
  type CatalogSort,
} from "@/lib/product-query";

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
  imagePath: string;
  images?: { id: string; path: string; sortOrder: number }[];
  category: { name: string };
  attributes: { key: string; value: string }[];
  substitutes: {
    substitute: { id: string; sku: string; name: string };
  }[];
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
    images: [...(row.images ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ id: item.id, path: item.path })),
    imagePath:
      [...(row.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0]
        ?.path ?? row.imagePath,
    attributes: row.attributes.map((item) => ({
      key: item.key,
      value: item.value,
    })),
    substitutes: row.substitutes.map((item) => item.substitute.sku),
    substituteLinks: row.substitutes.map((item) => ({
      id: item.substitute.id,
      sku: item.substitute.sku,
      name: item.substitute.name,
    })),
  };
}

const includeList = {
  category: true,
  attributes: true,
  substitutes: { include: { substitute: true } },
} as const;

const include = {
  ...includeList,
  images: true,
} as const;

function orderByFor(sort: CatalogSort): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "name":
      return { name: "asc" };
    case "price":
      return { price: "asc" };
    case "stock":
      return { stock: "asc" };
    case "updated":
      return { updatedAt: "desc" };
    default:
      return { sku: "asc" };
  }
}

async function resolveCategoryFilter(name: string) {
  if (name === "ALL") {
    return { ok: true as const, id: undefined as string | undefined };
  }
  const row = await prisma.category.findUnique({
    where: { name },
    select: { id: true },
  });
  if (!row) return { ok: false as const };
  return { ok: true as const, id: row.id };
}

async function productWhere(
  query: Pick<CatalogQuery, "q" | "status" | "category">,
): Promise<Prisma.ProductWhereInput | { empty: true }> {
  const where: Prisma.ProductWhereInput = {};
  if (query.status !== "ALL") where.status = query.status;

  const category = await resolveCategoryFilter(query.category);
  if (!category.ok) return { empty: true };
  if (category.id) where.categoryId = category.id;

  const q = query.q.trim();
  if (q) {
    where.OR = [
      { sku: { contains: q } },
      { name: { contains: q } },
      { brand: { contains: q } },
      { ean: { contains: q } },
      { manufacturerCode: { contains: q } },
      { warehouseLocation: { contains: q } },
    ];
  }
  return where;
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: includeList,
    orderBy: { sku: "asc" },
  });
  return rows.map(mapProduct);
}

export async function listProducts(
  query: Pick<CatalogQuery, "q" | "status" | "category" | "sort">,
): Promise<Product[]> {
  const where = await productWhere(query);
  if ("empty" in where) return [];
  const rows = await prisma.product.findMany({
    where,
    include: includeList,
    orderBy: orderByFor(query.sort),
  });
  return rows.map(mapProduct);
}

export async function searchProducts(query: CatalogQuery) {
  const where = await productWhere(query);
  if ("empty" in where) {
    return { items: [] as Product[], total: 0, page: 1, pageCount: 1 };
  }

  const total = await prisma.product.count({ where });
  const page = clampPage(query.page, total);
  const rows = await prisma.product.findMany({
    where,
    include: includeList,
    orderBy: orderByFor(query.sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return {
    items: rows.map(mapProduct),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE) || 1),
  };
}

export async function getSkuOptions(excludeSku?: string) {
  const rows = await prisma.product.findMany({
    orderBy: { sku: "asc" },
    select: { sku: true, name: true },
    take: 500,
  });
  return rows.filter((row) => row.sku !== excludeSku);
}

async function findProductDetailed(where: { id: string } | { sku: string }) {
  try {
    return await prisma.product.findUnique({ where, include });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientValidationError)) throw error;
    return prisma.product.findUnique({ where, include: includeList });
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await findProductDetailed({ id });
  return row ? mapProduct(row) : null;
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const row = await findProductDetailed({ sku });
  return row ? mapProduct(row) : null;
}

export async function getDashboardStats() {
  const [total, active, outOfStock, categories] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.category.count(),
  ]);

  return [
    { label: "Produkty w bazie", value: String(total) },
    { label: "Aktywne SKU", value: String(active) },
    { label: "Braki magazynowe", value: String(outOfStock) },
    { label: "Kategorie", value: String(categories) },
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

export async function setProductImagePath(
  id: string,
  imagePath: string,
): Promise<WriteResult> {
  try {
    await prisma.product.update({
      where: { id },
      data: { imagePath },
    });
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export async function replaceProductGallery(
  productId: string,
  next: { path: string }[],
): Promise<WriteResult> {
  try {
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId } }),
      ...(next.length
        ? [
            prisma.productImage.createMany({
              data: next.map((item, index) => ({
                productId,
                path: item.path,
                sortOrder: index,
              })),
            }),
          ]
        : []),
      prisma.product.update({
        where: { id: productId },
        data: { imagePath: next[0]?.path ?? "" },
      }),
    ]);
    return { ok: true, id: productId };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export async function duplicateProduct(id: string): Promise<WriteResult> {
  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      include,
    });
    if (!existing) {
      return { ok: false, error: "Nie znaleziono karty." };
    }

    let sku = `${existing.sku}-KOPIA`;
    let n = 2;
    while (await prisma.product.findUnique({ where: { sku } })) {
      sku = `${existing.sku}-KOPIA${n}`;
      n += 1;
    }

    const row = await prisma.product.create({
      data: {
        sku,
        ean: existing.ean,
        manufacturerCode: existing.manufacturerCode,
        name: `${existing.name} (kopia)`,
        brand: existing.brand,
        categoryId: existing.categoryId,
        unit: existing.unit,
        price: existing.price,
        vat: existing.vat,
        stock: existing.stock,
        minOrder: existing.minOrder,
        packageQty: existing.packageQty,
        warehouseLocation: existing.warehouseLocation,
        weightKg: existing.weightKg,
        voltage: existing.voltage,
        current: existing.current,
        ipRating: existing.ipRating,
        status: "DRAFT",
        description: existing.description,
        notes: existing.notes,
        attributes: {
          create: existing.attributes.map((item) => ({
            key: item.key,
            value: item.value,
          })),
        },
        substitutes: {
          create: existing.substitutes.map((item) => ({
            substituteId: item.substitute.id,
          })),
        },
      },
    });
    return { ok: true, id: row.id };
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
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}

export type BulkWriteResult =
  | { ok: true; count: number; skus: string[] }
  | { ok: false; error: string };

export async function bulkUpdateProducts(
  ids: string[],
  patch: { status?: ProductStatus; category?: string },
): Promise<BulkWriteResult> {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 50);
  if (unique.length === 0) {
    return { ok: false, error: "Zaznacz przynajmniej jedną kartę." };
  }
  if (!patch.status && !patch.category) {
    return { ok: false, error: "Wybierz nowy status albo kategorię." };
  }

  const data: { status?: ProductStatus; categoryId?: string } = {};
  if (patch.status) data.status = patch.status;
  if (patch.category) {
    data.categoryId = await resolveCategoryId(patch.category);
  }

  try {
    const rows = await prisma.product.findMany({
      where: { id: { in: unique } },
      select: { sku: true },
    });
    if (rows.length === 0) {
      return { ok: false, error: "Nie znaleziono zaznaczonych kart." };
    }

    await prisma.product.updateMany({
      where: { id: { in: unique } },
      data,
    });

    return {
      ok: true,
      count: rows.length,
      skus: rows.map((row) => row.sku),
    };
  } catch (error) {
    return { ok: false, error: prismaErrorMessage(error) };
  }
}
