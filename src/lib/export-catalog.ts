import * as XLSX from "xlsx";
import type { Product } from "@/lib/product";

export const exportHeaders = [
  "sku",
  "nazwa",
  "marka",
  "kategoria",
  "cena",
  "stan",
  "ean",
  "kod producenta",
  "jednostka",
  "vat",
  "status",
  "min zamowienie",
  "opakowanie",
  "lokalizacja",
  "waga",
  "napiecie",
  "prad",
  "ip",
  "opis",
  "notatka",
  "zamienniki",
  "atrybuty",
] as const;

export type ExportFormat = "xlsx" | "csv";

function formatAttributes(product: Product) {
  return product.attributes
    .filter((item) => item.key && item.value)
    .map((item) => `${item.key}:${item.value}`)
    .join(" | ");
}

export function productsToRows(products: Product[]) {
  return products.map((product) => [
    product.sku,
    product.name,
    product.brand,
    product.category,
    product.price,
    product.stock,
    product.ean,
    product.manufacturerCode,
    product.unit,
    product.vat,
    product.status,
    product.minOrder,
    product.packageQty,
    product.warehouseLocation,
    product.weightKg,
    product.voltage,
    product.current,
    product.ipRating,
    product.description,
    product.notes,
    product.substitutes.join(", "),
    formatAttributes(product),
  ]);
}

export function buildCatalogExport(products: Product[], format: ExportFormat) {
  const sheet = XLSX.utils.aoa_to_sheet([
    [...exportHeaders],
    ...productsToRows(products),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Katalog");
  const body = XLSX.write(workbook, {
    type: "buffer",
    bookType: format,
  }) as Buffer;
  const day = new Date().toISOString().slice(0, 10);
  const filename = `volt-pim-katalog-${day}.${format}`;
  const contentType =
    format === "csv"
      ? "text/csv; charset=utf-8"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return { body, filename, contentType };
}
