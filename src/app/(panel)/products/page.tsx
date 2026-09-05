import { ButtonLink } from "@/components/Button";
import { ProductCatalog } from "@/components/ProductCatalog";
import { getCategoryNames, getProducts } from "@/lib/catalog";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategoryNames(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produkty</h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/import" variant="ghost">
            Import
          </ButtonLink>
          <ButtonLink href="/products/new">Nowa karta</ButtonLink>
        </div>
      </div>
      <ProductCatalog products={products} categories={categories} />
    </div>
  );
}
