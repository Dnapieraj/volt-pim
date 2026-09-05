import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { getProductById } from "@/lib/catalog";

function formatPrice(value: number) {
  return value.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/products" className="text-sm text-copper">
        ← Wróć do listy
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted">{product.sku}</p>
          <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {product.brand}
            {product.ean ? ` · EAN ${product.ean}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={product.status} />
          <ButtonLink href={`/products/${product.id}/edit`}>Edytuj kartę</ButtonLink>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-lg border border-line bg-card p-6 text-sm">
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
        <div className="col-span-2">
          <dt className="text-muted">Opis</dt>
          <dd className="mt-1">{product.description || "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Notatka wewnętrzna</dt>
          <dd className="mt-1">{product.notes || "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Atrybuty</dt>
          <dd className="mt-1">
            {product.attributes.length === 0
              ? "—"
              : product.attributes
                  .map((item) => `${item.key}: ${item.value}`)
                  .join(" · ")}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Zamienniki</dt>
          <dd className="mt-1">
            {product.substitutes.length === 0
              ? "brak"
              : product.substitutes.join(", ")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
