"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
} from "@/app/(panel)/categories/actions";
import { Button } from "@/components/Button";
import type { CategoryRow } from "@/lib/categories";
import { emptyUserState } from "@/lib/user-input";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm min-h-11";

function Feedback({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="mt-3 rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
      >
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="mt-3 rounded-md border border-line bg-paper px-4 py-3 text-sm">
        {success}
      </p>
    );
  }
  return null;
}

export function CategoryManager({
  categories,
  canWrite,
}: {
  categories: CategoryRow[];
  canWrite: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(
    createCategoryAction,
    emptyUserState,
  );

  return (
    <div className="space-y-6">
      {canWrite ? (
        <form
          action={createAction}
          className="rounded-lg border border-line bg-card p-5"
        >
          <h2 className="font-medium">Nowa kategoria</h2>
          <p className="mt-1 text-sm text-muted">
            Słownik do filtrów i kart SKU. Pusta kategoria da się usunąć.
          </p>
          <Feedback error={createState.error} success={createState.success} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              name="name"
              required
              maxLength={80}
              placeholder="np. Kable solarne"
              className={inputClass}
            />
            <Button type="submit" variant="dark" disabled={createPending}>
              {createPending ? "Dodawanie…" : "Dodaj"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted">
          Masz podgląd — kategorie zmienia edytor albo administrator.
        </p>
      )}

      <ul className="space-y-3">
        {categories.map((row) => (
          <CategoryRowCard key={row.id} row={row} canWrite={canWrite} />
        ))}
      </ul>
    </div>
  );
}

function CategoryRowCard({
  row,
  canWrite,
}: {
  row: CategoryRow;
  canWrite: boolean;
}) {
  const [renameState, renameAction, renamePending] = useActionState(
    renameCategoryAction,
    emptyUserState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategoryAction,
    emptyUserState,
  );

  return (
    <li className="rounded-lg border border-line bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {row.productCount} {row.productCount === 1 ? "karta" : "kart"}
        </p>
      </div>
      {canWrite ? (
        <>
          <Feedback error={renameState.error} success={renameState.success} />
          <Feedback error={deleteState.error} success={deleteState.success} />
          <form
            action={renameAction}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <input type="hidden" name="id" value={row.id} />
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={row.name}
              className={inputClass}
              aria-label={`Nazwa kategorii ${row.name}`}
            />
            <Button type="submit" variant="ghost" disabled={renamePending}>
              {renamePending ? "Zapis…" : "Zmień nazwę"}
            </Button>
          </form>
          <form action={deleteAction} className="mt-2">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="name" value={row.name} />
            <Button
              type="submit"
              variant="ghost"
              disabled={deletePending || row.productCount > 0}
            >
              {row.productCount > 0
                ? "Usuń (najpierw przenieś karty)"
                : deletePending
                  ? "Usuwanie…"
                  : "Usuń pustą"}
            </Button>
          </form>
        </>
      ) : (
        <p className="mt-1 text-lg font-medium">{row.name}</p>
      )}
    </li>
  );
}
