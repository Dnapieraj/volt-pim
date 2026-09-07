export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type ProductAttribute = {
  key: string;
  value: string;
};

export type Product = {
  id: string;
  sku: string;
  ean: string;
  manufacturerCode: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  vat: number;
  stock: number;
  minOrder: number;
  packageQty: number;
  warehouseLocation: string;
  weightKg: number;
  voltage: string;
  current: string;
  ipRating: string;
  status: ProductStatus;
  description: string;
  notes: string;
  imagePath: string;
  attributes: ProductAttribute[];
  substitutes: string[];
};

export const categories = [
  "Przewody",
  "Aparatura",
  "Osprzęt",
  "Oświetlenie",
  "Rozdzielnice",
  "Narzędzia",
];

export const units = ["szt.", "m", "opak.", "kpl."];

export const emptyProduct: Product = {
  id: "",
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
  imagePath: "",
  attributes: [{ key: "", value: "" }],
  substitutes: [""],
};
