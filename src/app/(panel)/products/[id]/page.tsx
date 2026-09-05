import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { products } from "@/lib/mock";

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
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/products" className="text-sm text-copper">
        ← Wróć do listy
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted">{product.sku}</p>
          <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted">{product.brand}</p>
        </div>
        <StatusBadge status={product.status} />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-lg border border-line bg-card p-6 text-sm">
        <div>
          <dt className="text-muted">Kategoria</dt>
          <dd className="mt-1 font-medium">{product.category}</dd>
        </div>
        <div>
          <dt className="text-muted">Jednostka</dt>
          <dd className="mt-1 font-medium">{product.unit}</dd>
        </div>
        <div>
          <dt className="text-muted">Cena</dt>
          <dd className="mt-1 font-medium">{formatPrice(product.price)}</dd>
        </div>
        <div>
          <dt className="text-muted">Stan</dt>
          <dd className="mt-1 font-medium">
            {product.stock === 0 ? "brak na magazynie" : product.stock}
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
