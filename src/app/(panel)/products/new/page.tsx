import { ProductForm } from "@/components/ProductForm";
import { getCategoryNames } from "@/lib/catalog";
import { requireProductWrite } from "@/lib/current-user";

export default async function NewProductPage() {
  const [, categories] = await Promise.all([
    requireProductWrite(),
    getCategoryNames(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Nowa karta produktu</h1>
      <p className="mt-1 text-sm text-muted">
        Pełna karta jak w PIM: identyfikacja, magazyn, parametry, atrybuty,
        zamienniki. Zapis trafia do MariaDB.
      </p>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
