"use client";

import { useActionState, useState } from "react";
import { importCatalogAction } from "@/app/(panel)/import/actions";
import { Button } from "@/components/Button";
import { emptyImportState } from "@/lib/import-catalog";

export function ImportForm() {
  const [state, formAction, pending] = useActionState(
    importCatalogAction,
    emptyImportState,
  );
  const [fileName, setFileName] = useState("");

  const imported = (state.created ?? 0) + (state.updated ?? 0);
  const hasResult =
    Boolean(state.error) || imported > 0 || (state.errors?.length ?? 0) > 0;

  return (
    <>
      <form action={formAction} className="mt-6 space-y-4">
        <label
          className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-copper/40 bg-card px-6 py-14 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            const input = event.currentTarget.querySelector("input[type=file]");
            if (!(file && input instanceof HTMLInputElement)) return;
            const transfer = new DataTransfer();
            transfer.items.add(file);
            input.files = transfer.files;
            setFileName(file.name);
          }}
        >
          <p className="font-medium">Upuść plik albo kliknij, żeby wybrać</p>
          <p className="mt-1 text-sm text-muted">
            CSV / XLSX · max 1,5 MB · do 1000 wierszy
          </p>
          <p className="mt-3 text-sm text-ink">
            {fileName || "Nie wybrano pliku"}
          </p>
          <input
            name="file"
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            className="sr-only"
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? "");
            }}
          />
        </label>
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? "Importowanie…" : "Importuj do katalogu"}
        </Button>
      </form>

      {hasResult ? (
        <div className="mt-6 space-y-4">
          {state.error ? (
            <p
              role="alert"
              className="rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
            >
              {state.error}
            </p>
          ) : (
            <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">
              Zapisano {imported} kart: {state.created} nowych, {state.updated}{" "}
              zaktualizowanych
              {(state.errors?.length ?? 0)
                ? `, ${state.errors.length} z błędami`
                : "."}
            </p>
          )}

          {(state.errors?.length ?? 0) > 0 ? (
            <div className="overflow-hidden rounded-lg border border-line bg-card">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Wiersz</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Błąd</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.errors ?? []).map((item) => (
                    <tr
                      key={`${item.row}-${item.sku}-${item.message}`}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{item.row}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {item.sku || "—"}
                      </td>
                      <td className="px-4 py-3">{item.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
