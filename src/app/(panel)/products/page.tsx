import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { products } from "@/lib/mock";

function formatPrice(value: number) {
  return value.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}

export default function ProductsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produkty</h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} pozycji w katalogu przykładowym
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/import"
            className="rounded-md border border-line bg-card px-4 py-2 text-sm hover:border-ink/20"
          >
            Import
          </Link>
          <Link
            href="/products/new"
            className="rounded-md bg-copper px-4 py-2 text-sm font-medium text-white hover:bg-copper-dark"
          >
            Nowa karta
          </Link>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          placeholder="Szukaj SKU albo nazwy…"
          className="w-72 rounded-md border border-line bg-card px-3 py-2 text-sm"
        />
        <select className="rounded-md border border-line bg-card px-3 py-2 text-sm">
          <option>Wszystkie statusy</option>
          <option>Aktywny</option>
          <option>Szkic</option>
          <option>Archiwum</option>
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-line bg-card">
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
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/products/${product.id}`} className="text-copper">
                    {product.sku}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/products/${product.id}`} className="hover:underline">
                    {product.name}
                  </Link>
                  <div className="text-xs text-muted">{product.brand}</div>
                </td>
                <td className="px-4 py-3 text-muted">{product.category}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">{product.stock === 0 ? "brak" : product.stock}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={product.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
