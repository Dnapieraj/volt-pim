import { AuditList } from "@/components/AuditList";
import {
  auditActionOptions,
  getAuditLogs,
  parseAuditFilter,
} from "@/lib/audit";
import { Button } from "@/components/Button";

export const metadata = { title: "Historia zmian" };

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = parseAuditFilter(params);
  const entries = await getAuditLogs(filter);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Historia zmian</h1>
      <p className="mt-1 text-sm text-muted">
        Kto, kiedy, co zmienił — karty, import, edycja zbiorcza, konta i
        kategorie.
      </p>

      <form
        method="GET"
        className="mt-4 flex flex-wrap gap-2"
        action="/audit"
      >
        <input
          name="q"
          defaultValue={filter.q}
          placeholder="SKU, osoba, treść…"
          className="w-full min-h-11 rounded-md border border-line bg-card px-3 py-2 text-sm sm:w-72"
          aria-label="Szukaj w historii"
        />
        <select
          name="action"
          defaultValue={filter.action}
          className="min-h-11 rounded-md border border-line bg-card px-3 py-2 text-sm"
          aria-label="Typ zdarzenia"
        >
          <option value="ALL">Wszystkie zdarzenia</option>
          {auditActionOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="ghost">
          Filtruj
        </Button>
      </form>

      <div className="mt-6">
        <AuditList
          boxed
          entries={entries}
          empty="Brak wpisów. Historia pojawi się po dodaniu, edycji, usunięciu, imporcie albo zmianie konta."
        />
      </div>
    </div>
  );
}
