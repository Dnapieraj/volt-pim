import type { ProductStatus } from "@/lib/product";

export const PAGE_SIZE = 20;

export const catalogSorts = [
  "sku",
  "name",
  "price",
  "stock",
  "updated",
] as const;

export type CatalogSort = (typeof catalogSorts)[number];

export type CatalogQuery = {
  q: string;
  status: "ALL" | ProductStatus;
  category: string;
  sort: CatalogSort;
  page: number;
};

export const defaultCatalogQuery: CatalogQuery = {
  q: "",
  status: "ALL",
  category: "ALL",
  sort: "sku",
  page: 1,
};

function firstParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function isCatalogSort(value: string): value is CatalogSort {
  return (catalogSorts as readonly string[]).includes(value);
}

export function parseCatalogQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogQuery {
  const q = firstParam(searchParams.q).trim();
  const statusRaw = firstParam(searchParams.status).toUpperCase();
  const status: CatalogQuery["status"] =
    statusRaw === "ACTIVE" || statusRaw === "DRAFT" || statusRaw === "ARCHIVED"
      ? statusRaw
      : "ALL";
  const category = firstParam(searchParams.category).trim() || "ALL";
  const sortRaw = firstParam(searchParams.sort).trim() || "sku";
  const sort: CatalogSort = isCatalogSort(sortRaw) ? sortRaw : "sku";
  const pageRaw = Number.parseInt(firstParam(searchParams.page), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { q, status, category, sort, page };
}

export function catalogQueryString(
  query: Partial<CatalogQuery>,
  extras: Record<string, string> = {},
): string {
  const merged: CatalogQuery = { ...defaultCatalogQuery, ...query };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.status !== "ALL") params.set("status", merged.status);
  if (merged.category !== "ALL") params.set("category", merged.category);
  if (merged.sort !== "sku") params.set("sort", merged.sort);
  if (merged.page > 1) params.set("page", String(merged.page));
  for (const [key, value] of Object.entries(extras)) {
    if (value) params.set(key, value);
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export function catalogPageCount(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number, pageSize = PAGE_SIZE) {
  const pages = catalogPageCount(total, pageSize);
  return Math.min(Math.max(1, page), pages);
}

export const sortLabels: Record<CatalogSort, string> = {
  sku: "SKU",
  name: "Nazwa",
  price: "Cena",
  stock: "Stan (rosnąco)",
  updated: "Ostatnia zmiana",
};
