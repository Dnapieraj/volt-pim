import { ImportForm } from "@/components/ImportForm";
import { requireImportAccess } from "@/lib/current-user";

export default async function ImportPage() {
  await requireImportAccess();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Import z Excela</h1>
      <p className="mt-1 text-sm text-muted">
        Nowe SKU są tworzone, istniejące aktualizowane. Złe wiersze nie
        zatrzymują reszty — dostaniesz raport błędów.
      </p>

      <div className="mt-4 rounded-lg border border-line bg-card p-4 text-sm text-muted">
        <p>
          Wymagane: <span className="font-medium text-ink">SKU</span>. Nowa karta
          potrzebuje też <span className="font-medium text-ink">nazwy</span>.
          Puste komórki przy aktualizacji zostawiają dotychczasową wartość.
        </p>
        <p className="mt-2">
          Kolumny: sku, nazwa, marka, kategoria, cena, stan, ean, kod
          producenta, jednostka, vat, status, zamienniki, atrybuty, opis.
          Zamienniki rozdziel przecinkiem, atrybuty jak{" "}
          <span className="font-mono text-xs text-ink">
            Przekrój:3×2,5 mm² | Izolacja:PVC
          </span>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <a href="/wzor-import-volt-pim.csv" className="text-copper">
            Pobierz wzór CSV
          </a>
          <a href="/api/export" className="text-copper">
            Pobierz aktualny katalog (Excel)
          </a>
          <a href="/api/export?format=csv" className="text-copper">
            Pobierz aktualny katalog (CSV)
          </a>
        </div>
      </div>

      <ImportForm />
    </div>
  );
}
