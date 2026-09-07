"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { bulkUpdateProductsAction } from "@/app/(panel)/products/actions";
import { Pagination } from "@/components/Pagination";
import { ProductPhoto } from "@/components/ProductPhoto";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/format";
import { emptyBulkState } from "@/lib/product-input";
import type { Product } from "@/lib/product";
import {
  catalogQueryString,
  sortLabels,
  type CatalogQuery,
} from "@/lib/product-query";

const fieldClass =
  "rounded-md border border-line bg-card px-3 py-2 text-sm text-ink min-h-11";

export function ProductCatalog({
  products,
  categories,
  query,
  total,
  pageCount,
  canWrite,
}: {
  products: Product[];
  categories: string[];
  query: CatalogQuery;
  total: number;
  pageCount: number;
  canWrite: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkState, bulkAction, bulkPending] = useActionState(
    bulkUpdateProductsAction,
    emptyBulkState,
  );

  const visibleIds = products.map((product) => product.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  function toggleAll() {
    setSelected(allSelected ? [] : visibleIds);
  }

  function toggleOne(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  const hrefForPage = useMemo(
    () => (page: number) =>
      `/products${catalogQueryString({ ...query, page })}`,
    [query],
  );

  return (
    <>
      <p className="mt-1 text-sm text-muted">
        {products.length} na stronie · {total}{" "}
        {query.q || query.status !== "ALL" || query.category !== "ALL"
          ? "po filtrach"
          : "w bazie"}
      </p>

      <form
        method="GET"
        action="/products"
        className="mt-4 flex flex-wrap gap-2"
      >
        <input
          name="q"
          defaultValue={query.q}
          placeholder="Szukaj SKU, nazwy, marki, EAN…"
          className={`w-full sm:w-72 ${fieldClass}`}
          aria-label="Szukaj produktów"
        />
        <select
          name="status"
          defaultValue={query.status}
          className={fieldClass}
          aria-label="Filtr statusu"
        >
          <option value="ALL">Wszystkie statusy</option>
          <option value="ACTIVE">Aktywny</option>
          <option value="DRAFT">Szkic</option>
          <option value="ARCHIVED">Archiwum</option>
        </select>
        <select
          name="category"
          defaultValue={query.category}
          className={fieldClass}
          aria-label="Filtr kategorii"
        >
          <option value="ALL">Wszystkie kategorie</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={query.sort}
          className={fieldClass}
          aria-label="Sortowanie"
        >
          {Object.entries(sortLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="ghost" className="min-h-11">
          Filtruj
        </Button>
      </form>

      {canWrite && selected.length > 0 ? (
        <form
          action={bulkAction}
          className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-card p-3"
        >
          {selected.map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <p className="text-sm">
            Zaznaczono {selected.length}{" "}
            {selected.length === 1 ? "kartę" : "kart"}
          </p>
          <select
            name="bulkStatus"
            className={fieldClass}
            aria-label="Nowy status"
            defaultValue=""
          >
            <option value="">Status bez zmian</option>
            <option value="ACTIVE">Aktywny</option>
            <option value="DRAFT">Szkic</option>
            <option value="ARCHIVED">Archiwum</option>
          </select>
          <select
            name="bulkCategory"
            className={fieldClass}
            aria-label="Nowa kategoria"
            defaultValue=""
          >
            <option value="">Kategoria bez zmian</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button type="submit" variant="dark" disabled={bulkPending}>
            {bulkPending ? "Zapisywanie…" : "Zastosuj"}
          </Button>
          {bulkState.error ? (
            <p className="w-full text-sm text-warn" role="alert">
              {bulkState.error}
            </p>
          ) : null}
          {bulkState.message ? (
            <p className="w-full text-sm text-ok">{bulkState.message}</p>
          ) : null}
        </form>
      ) : null}

      <div className="mt-5">
        {products.length === 0 ? (
          <p className="rounded-lg border border-line bg-card px-4 py-10 text-center text-sm text-muted">
            Nic nie pasuje do tych filtrów. Zmień wyszukiwanie albo status.
          </p>
        ) : (
          <>
            <ul className="grid gap-3 md:hidden">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="rounded-lg border border-line bg-card p-3"
                >
                  <div className="flex gap-3">
                    {canWrite ? (
                      <input
                        type="checkbox"
                        className="mt-3 h-5 w-5 shrink-0"
                        checked={selected.includes(product.id)}
                        onChange={() => toggleOne(product.id)}
                        aria-label={`Zaznacz ${product.sku}`}
                      />
                    ) : null}
                    <Link href={`/products/${product.id}`} className="shrink-0">
                      <ProductPhoto
                        src={product.imagePath}
                        alt={product.name}
                        size="thumb"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="font-mono text-xs text-copper">
                        {product.sku}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {product.category} · {formatPrice(product.price)}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm">
                          {product.stock === 0 ? "brak" : product.stock}{" "}
                          {product.unit}
                        </span>
                        <StatusBadge status={product.status} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-lg border border-line bg-card md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {canWrite ? (
                      <th className="px-4 py-3 font-medium">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          aria-label="Zaznacz wszystkie na stronie"
                        />
                      </th>
                    ) : null}
                    <th className="px-4 py-3 font-medium">Zdjęcie</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Nazwa</th>
                    <th className="px-4 py-3 font-medium">Kategoria</th>
                    <th className="px-4 py-3 font-medium">Cena</th>
                    <th className="px-4 py-3 font-medium">Stan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-line last:border-0"
                    >
                      {canWrite ? (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(product.id)}
                            onChange={() => toggleOne(product.id)}
                            aria-label={`Zaznacz ${product.sku}`}
                          />
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${product.id}`}
                          className="block"
                        >
                          <ProductPhoto
                            src={product.imagePath}
                            alt={product.name}
                            size="thumb"
                          />
                        </Link>
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
                      <td className="px-4 py-3 text-muted">
                        {product.category}
                      </td>
                      <td className="px-4 py-3">
                        {formatPrice(product.price)}
                      </td>
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
            </div>
          </>
        )}
      </div>

      <Pagination
        page={query.page}
        pageCount={pageCount}
        hrefForPage={hrefForPage}
      />
    </>
  );
}
