import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CategoryRow = {
  id: string;
  name: string;
  productCount: number;
};

export type CategoryWriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function getManagedCategories(): Promise<CategoryRow[]> {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    productCount: row._count.products,
  }));
}

function categoryError(error: unknown): CategoryWriteResult {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { ok: false, error: "Taka kategoria już istnieje." };
    }
    if (error.code === "P2025") {
      return { ok: false, error: "Nie znaleziono kategorii." };
    }
  }
  return { ok: false, error: "Nie udało się zapisać kategorii." };
}

export async function createCategory(name: string): Promise<CategoryWriteResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Podaj nazwę kategorii." };
  if (trimmed.length > 80) {
    return { ok: false, error: "Nazwa kategorii jest za długa." };
  }
  try {
    const row = await prisma.category.create({ data: { name: trimmed } });
    return { ok: true, id: row.id };
  } catch (error) {
    return categoryError(error);
  }
}

export async function renameCategory(
  id: string,
  name: string,
): Promise<CategoryWriteResult> {
  const trimmed = name.trim();
  if (!id) return { ok: false, error: "Brak identyfikatora kategorii." };
  if (!trimmed) return { ok: false, error: "Podaj nazwę kategorii." };
  if (trimmed.length > 80) {
    return { ok: false, error: "Nazwa kategorii jest za długa." };
  }
  try {
    const row = await prisma.category.update({
      where: { id },
      data: { name: trimmed },
    });
    return { ok: true, id: row.id };
  } catch (error) {
    return categoryError(error);
  }
}

export async function deleteCategory(id: string): Promise<CategoryWriteResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora kategorii." };
  const row = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!row) return { ok: false, error: "Nie znaleziono kategorii." };
  if (row._count.products > 0) {
    return {
      ok: false,
      error: `Nie można usunąć „${row.name}” — ma ${row._count.products} kart. Przenieś je najpierw.`,
    };
  }
  await prisma.category.delete({ where: { id } });
  return { ok: true, id };
}
