import { ButtonLink } from "@/components/Button";
import { ProductCatalog } from "@/components/ProductCatalog";
import { getCategoryNames, getProducts } from "@/lib/catalog";
import { requireSessionUser } from "@/lib/current-user";
import {
  canImportCatalog,
  canWriteProducts,
} from "@/lib/permissions";

export default async function ProductsPage() {
  const user = await requireSessionUser();
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategoryNames(),
  ]);
  const canWrite = canWriteProducts(user.role);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produkty</h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/api/export" variant="ghost">
            Eksport Excel
          </ButtonLink>
          {canWrite ? (
            <>
              {canImportCatalog(user.role) ? (
                <ButtonLink href="/import" variant="ghost">
                  Import
                </ButtonLink>
              ) : null}
              <ButtonLink href="/products/new">Nowa karta</ButtonLink>
            </>
          ) : null}
        </div>
      </div>
      <ProductCatalog
        products={products}
        categories={categories}
        canWrite={canWrite}
      />
    </div>
  );
}
