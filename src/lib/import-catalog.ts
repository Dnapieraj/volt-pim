import * as XLSX from "xlsx";
import {
  createProduct,
  getProductBySku,
  updateProduct,
} from "@/lib/catalog";
import { units, type Product, type ProductStatus } from "@/lib/product";
import type { ProductWriteInput } from "@/lib/product-input";

export type ImportIssue = {
  row: number;
  sku: string;
  message: string;
};

export type ImportSummary = {
  created: number;
  updated: number;
  errors: ImportIssue[];
};

const MAX_ROWS = 1000;
const MAX_BYTES = 1_500_000;

const HEADER_MAP: Record<string, keyof Overlay> = {
  sku: "sku",
  kod: "sku",
  "kod sku": "sku",
  symbol: "sku",
  nazwa: "name",
  name: "name",
  produkt: "name",
  marka: "brand",
  brand: "brand",
  producent: "brand",
  kategoria: "category",
  category: "category",
  ean: "ean",
  "kod kreskowy": "ean",
  "kod producenta": "manufacturerCode",
  manufacturercode: "manufacturerCode",
  jednostka: "unit",
  unit: "unit",
  cena: "price",
  "cena netto": "price",
  price: "price",
  netto: "price",
  vat: "vat",
  stan: "stock",
  stock: "stock",
  ilosc: "stock",
  "min zamowienie": "minOrder",
  minorder: "minOrder",
  opakowanie: "packageQty",
  packageqty: "packageQty",
  lokalizacja: "warehouseLocation",
  warehouselocation: "warehouseLocation",
  waga: "weightKg",
  weightkg: "weightKg",
  napiecie: "voltage",
  voltage: "voltage",
  prad: "current",
  current: "current",
  ip: "ipRating",
  iprating: "ipRating",
  status: "status",
  opis: "description",
  description: "description",
  notatka: "notes",
  notes: "notes",
  zamienniki: "substitutes",
  substitutes: "substitutes",
  atrybuty: "attributes",
  attributes: "attributes",
};

type Overlay = {
  sku?: string;
  name?: string;
  brand?: string;
  category?: string;
  ean?: string;
  manufacturerCode?: string;
  unit?: string;
  price?: string;
  vat?: string;
  stock?: string;
  minOrder?: string;
  packageQty?: string;
  warehouseLocation?: string;
  weightKg?: string;
  voltage?: string;
  current?: string;
  ipRating?: string;
  status?: string;
  description?: string;
  notes?: string;
  substitutes?: string;
  attributes?: string;
};

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[_./-]+/g, " ")
    .replace(/\s+/g, " ");
}

function cellText(value: unknown) {
  if (value == null) return "";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function parseDecimal(raw: string) {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseIntValue(raw: string) {
  const value = parseDecimal(raw);
  if (value == null) return null;
  if (!Number.isInteger(value)) return null;
  return value;
}

function parseStatus(raw: string): ProductStatus | null {
  const key = normalizeHeader(raw);
  if (!key) return null;
  if (key === "active" || key === "aktywny") return "ACTIVE";
  if (key === "draft" || key === "szkic") return "DRAFT";
  if (key === "archived" || key === "archiwum") return "ARCHIVED";
  return null;
}

function parseAttributes(raw: string) {
  if (!raw) return [] as { key: string; value: string }[];
  return raw
    .split(/[|;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const splitAt = part.includes("=") ? part.indexOf("=") : part.indexOf(":");
      if (splitAt <= 0) return null;
      const key = part.slice(0, splitAt).trim();
      const value = part.slice(splitAt + 1).trim();
      if (!key || !value) return null;
      return { key, value };
    })
    .filter((item): item is { key: string; value: string } => item !== null);
}

function parseSubstitutes(raw: string) {
  if (!raw) return [] as string[];
  return [
    ...new Set(
      raw
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function toWriteInput(product: Product): ProductWriteInput {
  return {
    sku: product.sku,
    ean: product.ean,
    manufacturerCode: product.manufacturerCode,
    name: product.name,
    brand: product.brand,
    category: product.category,
    unit: product.unit,
    price: product.price,
    vat: product.vat,
    stock: product.stock,
    minOrder: product.minOrder,
    packageQty: product.packageQty,
    warehouseLocation: product.warehouseLocation,
    weightKg: product.weightKg,
    voltage: product.voltage,
    current: product.current,
    ipRating: product.ipRating,
    status: product.status,
    description: product.description,
    notes: product.notes,
    attributes: product.attributes.filter((item) => item.key && item.value),
    substitutes: product.substitutes,
  };
}

function applyOverlay(
  base: ProductWriteInput,
  overlay: Overlay,
  isNew: boolean,
): { ok: true; data: ProductWriteInput } | { ok: false; error: string } {
  const next: ProductWriteInput = { ...base, attributes: [...base.attributes] };

  if (overlay.sku) next.sku = overlay.sku;
  if (overlay.name) next.name = overlay.name;
  if (overlay.brand != null && overlay.brand !== "") next.brand = overlay.brand;
  if (overlay.category) next.category = overlay.category;
  if (overlay.ean != null && overlay.ean !== "") next.ean = overlay.ean;
  if (overlay.manufacturerCode != null && overlay.manufacturerCode !== "") {
    next.manufacturerCode = overlay.manufacturerCode;
  }
  if (overlay.unit) {
    if (!units.includes(overlay.unit)) {
      return {
        ok: false,
        error: `Nieobsługiwana jednostka „${overlay.unit}”. Dozwolone: ${units.join(", ")}.`,
      };
    }
    next.unit = overlay.unit;
  }
  if (overlay.price) {
    const price = parseDecimal(overlay.price);
    if (price == null || price < 0) {
      return { ok: false, error: "Cena musi być liczbą ≥ 0." };
    }
    next.price = price;
  }
  if (overlay.vat) {
    const vat = parseIntValue(overlay.vat);
    if (vat == null || ![0, 5, 8, 23].includes(vat)) {
      return { ok: false, error: "VAT musi być 0, 5, 8 albo 23." };
    }
    next.vat = vat;
  }
  if (overlay.stock) {
    const stock = parseIntValue(overlay.stock);
    if (stock == null || stock < 0) {
      return { ok: false, error: "Stan musi być liczbą całkowitą ≥ 0." };
    }
    next.stock = stock;
  }
  if (overlay.minOrder) {
    const minOrder = parseIntValue(overlay.minOrder);
    if (minOrder == null || minOrder < 1) {
      return { ok: false, error: "Min. zamówienie musi być liczbą całkowitą ≥ 1." };
    }
    next.minOrder = minOrder;
  }
  if (overlay.packageQty) {
    const packageQty = parseIntValue(overlay.packageQty);
    if (packageQty == null || packageQty < 1) {
      return { ok: false, error: "Ilość w opakowaniu musi być liczbą całkowitą ≥ 1." };
    }
    next.packageQty = packageQty;
  }
  if (overlay.warehouseLocation != null && overlay.warehouseLocation !== "") {
    next.warehouseLocation = overlay.warehouseLocation;
  }
  if (overlay.weightKg) {
    const weightKg = parseDecimal(overlay.weightKg);
    if (weightKg == null || weightKg < 0) {
      return { ok: false, error: "Waga musi być liczbą ≥ 0." };
    }
    next.weightKg = weightKg;
  }
  if (overlay.voltage != null && overlay.voltage !== "") {
    next.voltage = overlay.voltage;
  }
  if (overlay.current != null && overlay.current !== "") {
    next.current = overlay.current;
  }
  if (overlay.ipRating != null && overlay.ipRating !== "") {
    next.ipRating = overlay.ipRating;
  }
  if (overlay.status) {
    const status = parseStatus(overlay.status);
    if (!status) {
      return {
        ok: false,
        error: "Status musi być: aktywny, szkic albo archiwum.",
      };
    }
    next.status = status;
  }
  if (overlay.description != null && overlay.description !== "") {
    next.description = overlay.description;
  }
  if (overlay.notes != null && overlay.notes !== "") {
    next.notes = overlay.notes;
  }
  if (overlay.attributes != null && overlay.attributes !== "") {
    next.attributes = parseAttributes(overlay.attributes);
  }
  if (overlay.substitutes != null && overlay.substitutes !== "") {
    next.substitutes = parseSubstitutes(overlay.substitutes);
  }

  if (!next.sku) return { ok: false, error: "Puste SKU." };
  if (next.sku.length > 64) return { ok: false, error: "SKU jest za długie." };
  if (isNew && !next.name) return { ok: false, error: "Nowa karta wymaga nazwy." };
  if (next.name.length > 200) return { ok: false, error: "Nazwa jest za długa." };

  return { ok: true, data: next };
}

const emptyWrite = (): ProductWriteInput => ({
  sku: "",
  ean: "",
  manufacturerCode: "",
  name: "",
  brand: "",
  category: "Przewody",
  unit: "szt.",
  price: 0,
  vat: 23,
  stock: 0,
  minOrder: 1,
  packageQty: 1,
  warehouseLocation: "",
  weightKg: 0,
  voltage: "",
  current: "",
  ipRating: "",
  status: "DRAFT",
  description: "",
  notes: "",
  attributes: [],
  substitutes: [],
});

export type ImportActionState = {
  error: string;
  created: number;
  updated: number;
  errors: ImportIssue[];
};

export const emptyImportState: ImportActionState = {
  error: "",
  created: 0,
  updated: 0,
  errors: [],
};

export function parseImportWorkbook(
  buffer: ArrayBuffer,
): { ok: true; overlays: { row: number; overlay: Overlay }[] } | { ok: false; error: string } {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  } catch {
    return { ok: false, error: "Nie udało się odczytać pliku. Użyj CSV albo XLSX." };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { ok: false, error: "Plik nie ma arkusza." };
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(unknown | "")[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
    blankrows: false,
  });

  if (matrix.length < 2) {
    return { ok: false, error: "Brak wierszy z danymi. Pierwszy wiersz to nagłówki." };
  }

  const headers = (matrix[0] ?? []).map((cell) => HEADER_MAP[normalizeHeader(cell)]);
  if (!headers.includes("sku")) {
    return {
      ok: false,
      error: "Brak kolumny SKU. Dodaj nagłówek SKU (albo kod / symbol).",
    };
  }

  const overlays: { row: number; overlay: Overlay }[] = [];
  const dataRows = matrix.slice(1);
  if (dataRows.length > MAX_ROWS) {
    return {
      ok: false,
      error: `Za dużo wierszy (${dataRows.length}). Limit to ${MAX_ROWS}.`,
    };
  }

  for (let index = 0; index < dataRows.length; index += 1) {
    const line = dataRows[index] ?? [];
    const overlay: Overlay = {};
    let anyValue = false;
    headers.forEach((field, column) => {
      if (!field) return;
      const text = cellText(line[column]);
      if (!text) return;
      anyValue = true;
      overlay[field] = text;
    });
    if (!anyValue) continue;
    overlays.push({ row: index + 2, overlay });
  }

  if (overlays.length === 0) {
    return { ok: false, error: "Wszystkie wiersze są puste." };
  }

  return { ok: true, overlays };
}

export function assertImportFile(file: File | null): { ok: true } | { ok: false; error: string } {
  if (!file || file.size === 0) {
    return { ok: false, error: "Wybierz plik CSV albo XLSX." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Plik jest za duży (max 1,5 MB)." };
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
    return { ok: false, error: "Dozwolone rozszerzenia: .csv, .xlsx, .xls." };
  }
  return { ok: true };
}

export async function importCatalog(buffer: ArrayBuffer): Promise<ImportSummary> {
  const parsed = parseImportWorkbook(buffer);
  if (!parsed.ok) {
    return {
      created: 0,
      updated: 0,
      errors: [{ row: 1, sku: "", message: parsed.error }],
    };
  }

  const seen = new Map<string, number>();
  const errors: ImportIssue[] = [];
  const candidates: {
    row: number;
    sku: string;
    isNew: boolean;
    existingId?: string;
    data: ProductWriteInput;
    replaceSubstitutes: boolean;
  }[] = [];

  for (const item of parsed.overlays) {
    const sku = (item.overlay.sku ?? "").trim();
    const previous = sku ? seen.get(sku.toLowerCase()) : undefined;
    if (sku && previous) {
      errors.push({
        row: item.row,
        sku,
        message: `Zduplikowany kod ${sku} (pierwszy raz w wierszu ${previous}).`,
      });
      continue;
    }
    if (sku) seen.set(sku.toLowerCase(), item.row);

    const existing = sku ? await getProductBySku(sku) : null;
    const isNew = !existing;
    const applied = applyOverlay(
      existing ? toWriteInput(existing) : emptyWrite(),
      item.overlay,
      isNew,
    );
    if (!applied.ok) {
      errors.push({ row: item.row, sku, message: applied.error });
      continue;
    }

    candidates.push({
      row: item.row,
      sku: applied.data.sku,
      isNew,
      existingId: existing?.id,
      data: applied.data,
      replaceSubstitutes: Boolean(item.overlay.substitutes),
    });
  }

  const imported = new Set<string>();
  let created = 0;
  let updated = 0;

  for (const item of candidates) {
    const firstPass: ProductWriteInput = {
      ...item.data,
      substitutes: item.replaceSubstitutes
        ? []
        : item.data.substitutes,
    };
    const result = item.isNew
      ? await createProduct(firstPass)
      : await updateProduct(item.existingId as string, firstPass);
    if (!result.ok) {
      errors.push({ row: item.row, sku: item.sku, message: result.error });
      continue;
    }
    imported.add(item.sku);
    if (item.isNew) created += 1;
    else updated += 1;
  }

  for (const item of candidates) {
    if (!imported.has(item.sku) || !item.replaceSubstitutes) continue;
    const wanted = item.data.substitutes;
    if (wanted.length === 0) continue;

    const missing = wanted.filter((sku) => {
      if (sku === item.sku) return false;
      return !imported.has(sku);
    });
    const stillMissing: string[] = [];
    for (const sku of missing) {
      if (!(await getProductBySku(sku))) stillMissing.push(sku);
    }
    if (stillMissing.length > 0) {
      errors.push({
        row: item.row,
        sku: item.sku,
        message: `Karta zapisana, ale brak zamienników: ${stillMissing.join(", ")}.`,
      });
      continue;
    }

    const saved = await getProductBySku(item.sku);
    if (!saved) continue;
    const result = await updateProduct(saved.id, {
      ...toWriteInput(saved),
      substitutes: wanted,
    });
    if (!result.ok) {
      errors.push({ row: item.row, sku: item.sku, message: result.error });
    }
  }

  return { created, updated, errors };
}
