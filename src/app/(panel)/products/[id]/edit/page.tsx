import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { getProductById } from "@/lib/catalog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Edycja karty</h1>
      <p className="mt-1 font-mono text-sm text-muted">{product.sku}</p>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
