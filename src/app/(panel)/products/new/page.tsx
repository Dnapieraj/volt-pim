import { ProductForm } from "@/components/ProductForm";
import { getCategoryNames } from "@/lib/catalog";

export default async function NewProductPage() {
  const categories = await getCategoryNames();

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
