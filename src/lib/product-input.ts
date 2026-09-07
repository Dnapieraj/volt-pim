import { z } from "zod";
import type { ProductStatus } from "@/lib/product";

export type ProductActionState = {
  error: string;
};

export const emptyActionState: ProductActionState = { error: "" };

export type BulkActionState = {
  error: string;
  message: string;
};

export const emptyBulkState: BulkActionState = { error: "", message: "" };

const statusSchema = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function pairs(formData: FormData, keyName: string, valueName: string) {
  const keys = formData.getAll(keyName).map((item) => String(item).trim());
  const values = formData.getAll(valueName).map((item) => String(item).trim());
  return keys
    .map((key, index) => ({ key, value: values[index] ?? "" }))
    .filter((row) => row.key && row.value);
}

const schema = z.object({
  sku: z.string().trim().min(1, "Podaj SKU.").max(64, "SKU jest za długie."),
  ean: z.string().max(32, "EAN jest za długi.").default(""),
  manufacturerCode: z
    .string()
    .max(64, "Kod producenta jest za długi.")
    .default(""),
  name: z.string().trim().min(1, "Podaj nazwę.").max(200, "Nazwa jest za długa."),
  brand: z.string().max(80, "Marka jest za długa.").default(""),
  category: z.string().trim().min(1, "Wybierz kategorię."),
  unit: z.string().trim().min(1, "Wybierz jednostkę."),
  price: z.coerce.number().min(0, "Cena nie może być ujemna."),
  vat: z.coerce
    .number()
    .int()
    .refine(
      (value) => [0, 5, 8, 23].includes(value),
      "Nieobsługiwana stawka VAT.",
    ),
  stock: z.coerce.number().int().min(0, "Stan nie może być ujemny."),
  minOrder: z.coerce
    .number()
    .int()
    .min(1, "Minimalne zamówienie to co najmniej 1."),
  packageQty: z.coerce
    .number()
    .int()
    .min(1, "Ilość w opakowaniu to co najmniej 1."),
  warehouseLocation: z.string().max(64, "Lokalizacja jest za długa.").default(""),
  weightKg: z.coerce.number().min(0, "Waga nie może być ujemna."),
  voltage: z.string().max(64, "Napięcie jest za długie.").default(""),
  current: z.string().max(64, "Prąd jest za długi.").default(""),
  ipRating: z.string().max(32, "Stopień IP jest za długi.").default(""),
  status: statusSchema,
  description: z.string().max(4000, "Opis jest za długi.").default(""),
  notes: z.string().max(4000, "Notatka jest za długa.").default(""),
});

export type ProductWriteInput = z.infer<typeof schema> & {
  attributes: { key: string; value: string }[];
  substitutes: string[];
  status: ProductStatus;
};

export function parseProductForm(
  formData: FormData,
): { ok: true; data: ProductWriteInput } | { ok: false; error: string } {
  const parsed = schema.safeParse({
    sku: text(formData, "sku"),
    ean: text(formData, "ean"),
    manufacturerCode: text(formData, "manufacturerCode"),
    name: text(formData, "name"),
    brand: text(formData, "brand"),
    category: text(formData, "newCategory") || text(formData, "category"),
    unit: text(formData, "unit"),
    price: formData.get("price") || "0",
    vat: formData.get("vat") || "23",
    stock: formData.get("stock") || "0",
    minOrder: formData.get("minOrder") || "1",
    packageQty: formData.get("packageQty") || "1",
    warehouseLocation: text(formData, "warehouseLocation"),
    weightKg: formData.get("weightKg") || "0",
    voltage: text(formData, "voltage"),
    current: text(formData, "current"),
    ipRating: text(formData, "ipRating"),
    status: text(formData, "status") || "DRAFT",
    description: String(formData.get("description") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Sprawdź dane karty i spróbuj ponownie.",
    };
  }

  const substitutes = [
    ...new Set(
      formData
        .getAll("substituteSku")
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];

  return {
    ok: true,
    data: {
      ...parsed.data,
      attributes: pairs(formData, "attributeKey", "attributeValue"),
      substitutes,
    },
  };
}

export function formId(formData: FormData) {
  return text(formData, "id");
}
