"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { Product, ProductStatus } from "@/lib/product";

function formatPrice(value: number) {
  return value.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}

function matchesQuery(query: string, product: Product) {
  if (!query) return true;
  const haystack = [
    product.sku,
    product.name,
    product.brand,
    product.ean,
    product.manufacturerCode,
    product.category,
    product.warehouseLocation,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function ProductCatalog({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | ProductStatus>("ALL");
  const [category, setCategory] = useState("ALL");

  const normalizedQuery = query.trim().toLowerCase();

  const visible = useMemo(() => {
    return products.filter((product) => {
      if (status !== "ALL" && product.status !== status) return false;
      if (category !== "ALL" && product.category !== category) return false;
      return matchesQuery(normalizedQuery, product);
    });
  }, [normalizedQuery, status, category]);

  return (
    <>
      <p className="mt-1 text-sm text-muted">
        {visible.length} z {products.length} pozycji
        {normalizedQuery || status !== "ALL" || category !== "ALL"
          ? " (po filtrach)"
          : " w bazie"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj SKU, nazwy, marki, EAN…"
          className="w-72 rounded-md border border-line bg-card px-3 py-2 text-sm text-ink"
          aria-label="Szukaj produktów"
        />
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "ALL" | ProductStatus)
          }
          className="rounded-md border border-line bg-card px-3 py-2 text-sm text-ink"
          aria-label="Filtr statusu"
        >
          <option value="ALL">Wszystkie statusy</option>
          <option value="ACTIVE">Aktywny</option>
          <option value="DRAFT">Szkic</option>
          <option value="ARCHIVED">Archiwum</option>
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-md border border-line bg-card px-3 py-2 text-sm text-ink"
          aria-label="Filtr kategorii"
        >
          <option value="ALL">Wszystkie kategorie</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-line bg-card">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Nic nie pasuje do „{query || "tych filtrów"}”. Zmień wyszukiwanie
            albo status.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Nazwa</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium">Cena</th>
                <th className="px-4 py-3 font-medium">Stan</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-copper"
                    >
                      {product.sku}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="hover:underline"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-muted">{product.brand}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category}</td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    {product.stock === 0 ? "brak" : product.stock}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
