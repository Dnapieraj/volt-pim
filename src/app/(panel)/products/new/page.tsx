import { ProductForm } from "@/components/ProductForm";
import { getCategoryNames, getSkuOptions } from "@/lib/catalog";
import { requireProductWrite } from "@/lib/current-user";

export const metadata = { title: "Nowa karta" };

export default async function NewProductPage() {
  const [, categories, catalogSkus] = await Promise.all([
    requireProductWrite(),
    getCategoryNames(),
    getSkuOptions(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Nowa karta produktu</h1>
      <p className="mt-1 text-sm text-muted">
        Pełna karta jak w PIM: zdjęcie, identyfikacja, magazyn, atrybuty i
        zamienniki z katalogu.
      </p>
      <ProductForm
        mode="create"
        categories={categories}
        catalogSkus={catalogSkus}
      />
    </div>
  );
}
