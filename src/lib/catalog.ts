import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/product";

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
  };
}

const include = {
  category: true,
  attributes: true,
  substitutes: { include: { substitute: true } },
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
