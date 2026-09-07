import { CategoryManager } from "@/components/CategoryManager";
import { getManagedCategories } from "@/lib/categories";
import { requireSessionUser } from "@/lib/current-user";
import { canManageCategories } from "@/lib/permissions";

export const metadata = { title: "Kategorie" };

export default async function CategoriesPage() {
  const user = await requireSessionUser();
  const categories = await getManagedCategories();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Kategorie</h1>
      <p className="mt-1 text-sm text-muted">
        Słownik do filtrów i kart. Zmiana nazwy od razu widać na produktach.
      </p>
      <div className="mt-6">
        <CategoryManager
          categories={categories}
          canWrite={canManageCategories(user.role)}
        />
      </div>
    </div>
  );
}
