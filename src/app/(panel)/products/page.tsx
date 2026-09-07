import { ButtonLink } from "@/components/Button";
import { ProductCatalog } from "@/components/ProductCatalog";
import { getCategoryNames, searchProducts } from "@/lib/catalog";
import { requireSessionUser } from "@/lib/current-user";
import {
  canImportCatalog,
  canWriteProducts,
} from "@/lib/permissions";
import {
  catalogQueryString,
  parseCatalogQuery,
} from "@/lib/product-query";

export const metadata = { title: "Produkty" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseCatalogQuery(params);
  const user = await requireSessionUser();
  const [{ items, total, page, pageCount }, categories] = await Promise.all([
    searchProducts(query),
    getCategoryNames(),
  ]);
  const canWrite = canWriteProducts(user.role);
  const exportQuery = catalogQueryString({ ...query, page: 1 });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produkty</h1>
          <p className="mt-1 text-sm text-muted">
            Szukanie i sortowanie idzie do bazy. Eksport bierze te same filtry.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/api/export${exportQuery}`} variant="ghost">
            Excel
          </ButtonLink>
          <ButtonLink
            href={`/api/export${catalogQueryString({ ...query, page: 1 }, { format: "csv" })}`}
            variant="ghost"
          >
            CSV
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
        products={items}
        categories={categories}
        query={{ ...query, page }}
        total={total}
        pageCount={pageCount}
        canWrite={canWrite}
      />
    </div>
  );
}
