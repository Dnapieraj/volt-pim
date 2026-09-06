"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  bulkUpdateProductsAction,
  emptyBulkState,
} from "@/app/(panel)/products/actions";
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
  canWrite = false,
}: {
  products: Product[];
  categories: string[];
  canWrite?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | ProductStatus>("ALL");
  const [category, setCategory] = useState("ALL");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkState, bulkAction, bulkPending] = useActionState(
    bulkUpdateProductsAction,
    emptyBulkState,
  );

  const normalizedQuery = query.trim().toLowerCase();

  const visible = useMemo(() => {
    return products.filter((product) => {
      if (status !== "ALL" && product.status !== status) return false;
      if (category !== "ALL" && product.category !== category) return false;
      return matchesQuery(normalizedQuery, product);
    });
  }, [products, normalizedQuery, status, category]);

  const visibleIds = visible.map((product) => product.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...visibleIds])]);
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

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

      {canWrite && selected.length > 0 ? (
        <form
          action={bulkAction}
          className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-line bg-card p-3"
        >
          {selected.map((id) => (
            <input key={id} type="hidden" name="productId" value={id} />
          ))}
          <p className="w-full text-sm text-ink">
            Zaznaczono {selected.length}{" "}
            {selected.length === 1 ? "kartę" : "kart"}
          </p>
          <label className="text-sm">
            Nowy status
            <select
              name="bulkStatus"
              defaultValue="KEEP"
              className="mt-1 block rounded-md border border-line bg-paper px-3 py-2 text-sm"
            >
              <option value="KEEP">Bez zmian</option>
              <option value="ACTIVE">Aktywny</option>
              <option value="DRAFT">Szkic</option>
              <option value="ARCHIVED">Archiwum</option>
            </select>
          </label>
          <label className="text-sm">
            Nowa kategoria
            <select
              name="bulkCategory"
              defaultValue="KEEP"
              className="mt-1 block rounded-md border border-line bg-paper px-3 py-2 text-sm"
            >
              <option value="KEEP">Bez zmian</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="dark" disabled={bulkPending}>
            {bulkPending ? "Zapisywanie…" : "Zastosuj"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setSelected([])}>
            Odznacz
          </Button>
          {bulkState.error ? (
            <p role="alert" className="w-full text-sm text-warn">
              {bulkState.error}
            </p>
          ) : null}
          {bulkState.message ? (
            <p className="w-full text-sm text-copper">{bulkState.message}</p>
          ) : null}
        </form>
      ) : null}

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
                {canWrite ? (
                  <th className="px-3 py-3 font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      aria-label="Zaznacz widoczne"
                    />
                  </th>
                ) : null}
                <th className="px-3 py-3 font-medium">Foto</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Nazwa</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium">Cena</th>
                <th className="px-4 py-3 font-medium">Stan</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const thumb = product.images[0];
                return (
                  <tr
                    key={product.id}
                    className="border-b border-line last:border-0"
                  >
                    {canWrite ? (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(product.id)}
                          onChange={() => toggleOne(product.id)}
                          aria-label={`Zaznacz ${product.sku}`}
                        />
                      </td>
                    ) : null}
                    <td className="px-3 py-2">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb.url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-paper text-[10px] text-muted">
                          brak
                        </span>
                      )}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
