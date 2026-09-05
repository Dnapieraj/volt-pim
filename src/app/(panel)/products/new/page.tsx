import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Nowa karta produktu</h1>
      <p className="mt-1 text-sm text-muted">
        Pełna karta jak w PIM: identyfikacja, magazyn, parametry, atrybuty,
        zamienniki. Zapis do bazy w kolejnym kroku.
      </p>
      <ProductForm mode="create" />
    </div>
  );
}
