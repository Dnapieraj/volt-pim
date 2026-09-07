import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { DuplicateProductButton } from "@/components/DuplicateProductButton";
import { ProductGallery } from "@/components/ProductGallery";
import { StatusBadge } from "@/components/StatusBadge";
import { getProductById } from "@/lib/catalog";
import { requireSessionUser } from "@/lib/current-user";
import { formatPrice } from "@/lib/format";
import {
  canDeleteProducts,
  canWriteProducts,
} from "@/lib/permissions";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, product] = await Promise.all([
    requireSessionUser(),
    getProductById(id),
  ]);
  if (!product) notFound();
  const canWrite = canWriteProducts(user.role);
  const canDelete = canDeleteProducts(user.role);

  return (
    <div className="max-w-4xl">
      <Link href="/products" className="text-sm text-copper">
        ← Wróć do listy
      </Link>
      <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(14rem,18rem)_1fr] sm:items-start">
        <ProductGallery images={product.images} alt={product.name} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted">{product.sku}</p>
            <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {product.brand}
              {product.ean ? ` · EAN ${product.ean}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            {canWrite ? (
              <>
                <ButtonLink href={`/products/${product.id}/edit`}>
                  Edytuj kartę
                </ButtonLink>
                <DuplicateProductButton id={product.id} />
              </>
            ) : null}
            {canDelete ? (
              <DeleteProductButton id={product.id} sku={product.sku} />
            ) : null}
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-4 rounded-lg border border-line bg-card p-4 text-sm sm:grid-cols-2 sm:p-6">
        <div>
          <dt className="text-muted">Kod producenta</dt>
          <dd className="mt-1 font-medium">{product.manufacturerCode || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Kategoria</dt>
          <dd className="mt-1 font-medium">{product.category}</dd>
        </div>
        <div>
          <dt className="text-muted">Cena netto</dt>
          <dd className="mt-1 font-medium">{formatPrice(product.price)}</dd>
        </div>
        <div>
          <dt className="text-muted">VAT</dt>
          <dd className="mt-1 font-medium">{product.vat}%</dd>
        </div>
        <div>
          <dt className="text-muted">Stan / min. zamówienie</dt>
          <dd className="mt-1 font-medium">
            {product.stock === 0 ? "brak" : product.stock} {product.unit} · min.{" "}
            {product.minOrder}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Lokalizacja</dt>
          <dd className="mt-1 font-medium">{product.warehouseLocation || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Napięcie / prąd / IP</dt>
          <dd className="mt-1 font-medium">
            {[product.voltage, product.current, product.ipRating]
              .filter(Boolean)
              .join(" · ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Opakowanie / waga</dt>
          <dd className="mt-1 font-medium">
            {product.packageQty} szt. · {product.weightKg} kg
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Opis</dt>
          <dd className="mt-1">{product.description || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Notatka wewnętrzna</dt>
          <dd className="mt-1">{product.notes || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Atrybuty</dt>
          <dd className="mt-1">
            {product.attributes.length === 0
              ? "—"
              : product.attributes
                  .map((item) => `${item.key}: ${item.value}`)
                  .join(" · ")}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Zamienniki</dt>
          <dd className="mt-1">
            {product.substituteLinks.length === 0 ? (
              "brak"
            ) : (
              <ul className="space-y-1">
                {product.substituteLinks.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.id}`}
                      className="text-copper hover:underline"
                    >
                      <span className="font-mono text-xs">{item.sku}</span>
                      <span className="text-ink"> — {item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
