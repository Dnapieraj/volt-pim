export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  status: ProductStatus;
  substitutes: string[];
};

export const products: Product[] = [
  {
    id: "1",
    sku: "YDY-3X2.5",
    name: "Przewód YDY 3×2,5 mm²",
    brand: "Bitner",
    category: "Przewody",
    unit: "m",
    price: 4.8,
    stock: 420,
    status: "ACTIVE",
    substitutes: ["YDY-3X1.5"],
  },
  {
    id: "2",
    sku: "YDY-3X1.5",
    name: "Przewód YDY 3×1,5 mm²",
    brand: "Bitner",
    category: "Przewody",
    unit: "m",
    price: 3.2,
    stock: 880,
    status: "ACTIVE",
    substitutes: ["YDY-3X2.5"],
  },
  {
    id: "3",
    sku: "MCB-B16",
    name: "Wyłącznik nadprądowy B16 1P",
    brand: "Schneider",
    category: "Aparatura",
    unit: "szt.",
    price: 28.9,
    stock: 64,
    status: "ACTIVE",
    substitutes: ["MCB-C16"],
  },
  {
    id: "4",
    sku: "MCB-C16",
    name: "Wyłącznik nadprądowy C16 1P",
    brand: "Hager",
    category: "Aparatura",
    unit: "szt.",
    price: 31.5,
    stock: 12,
    status: "ACTIVE",
    substitutes: ["MCB-B16"],
  },
  {
    id: "5",
    sku: "GN-230",
    name: "Gniazdo natynkowe 230V IP44",
    brand: "Legrand",
    category: "Osprzęt",
    unit: "szt.",
    price: 19.9,
    stock: 0,
    status: "DRAFT",
    substitutes: [],
  },
  {
    id: "6",
    sku: "LED-36W",
    name: "Oprawa LED 36W 4000K",
    brand: "Philips",
    category: "Oświetlenie",
    unit: "szt.",
    price: 89,
    stock: 27,
    status: "ARCHIVED",
    substitutes: [],
  },
];

export const stats = [
  { label: "Produkty w bazie", value: "6" },
  { label: "Aktywne SKU", value: "4" },
  { label: "Braki magazynowe", value: "1" },
  { label: "Ostatni import", value: "wczoraj" },
];

export const auditPreview = [
  { who: "Anna K.", action: "edytowała", what: "MCB-B16", when: "dziś, 08:14" },
  { who: "Marek W.", action: "zaimportował", what: "18 wierszy z Excela", when: "wczoraj, 16:02" },
  { who: "Ty", action: "dodałeś", what: "GN-230", when: "2 dni temu" },
];
